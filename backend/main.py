from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime
import os

from database import get_db, init_db
from models import Recipe, Ingredient, Step, Review, MenuPlan, MenuPlanAdditional, UserIngredient, PurchasedItem
from schemas import (
    RecipeResponse,
    RecipeListItem,
    RecipeCreate,
    ReviewCreate,
    ReviewResponse,
    MenuPlanCreate,
    MenuPlanResponse,
    UserIngredientCreate,
    UserIngredientResponse,
    PurchasedItemCreate,
    PurchasedItemResponse,
)

app = FastAPI(
    title="VibeCoders API",
    description="Backend API for VibeCoders Solution",
    version="1.0.0"
)

# CORS middleware для работы с Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Инициализация БД при старте приложения"""
    try:
        init_db()
        print("База данных инициализирована")
        
        # Заполняем БД тестовыми данными, если она пустая
        from sqlalchemy.orm import Session
        from database import SessionLocal
        
        db = SessionLocal()
        try:
            recipe_count = db.query(Recipe).count()
            if recipe_count == 0:
                print("База данных пустая, заполняем тестовыми данными...")
                from seed_data import seed_database
                seed_database()
                print("Тестовые данные добавлены")
            else:
                print(f"В базе данных уже есть {recipe_count} рецептов")
        finally:
            db.close()
    except Exception as e:
        print(f"Ошибка при инициализации БД: {e}")


@app.get("/")
async def root():
    return {
        "message": "Welcome to VibeCoders API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# ========== Recipe Endpoints ==========

@app.get("/api/recipes", response_model=List[RecipeListItem])
async def get_recipes(
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    search: Optional[str] = Query(None, description="Поисковый запрос"),
    db: Session = Depends(get_db)
):
    """Получить список рецептов с фильтрацией по категории и поиску"""
    query = db.query(Recipe)
    
    # Фильтр по категории
    if category and category != "Все":
        query = query.filter(Recipe.category == category)
    
    # Поиск по названию или ингредиентам
    if search:
        search_lower = search.lower()
        # Поиск по названию
        query = query.filter(
            Recipe.title.ilike(f"%{search_lower}%")
        )
        # Или поиск по ингредиентам (через подзапрос)
        ingredient_ids = db.query(Ingredient.recipe_id).filter(
            Ingredient.name.ilike(f"%{search_lower}%")
        ).distinct()
        query = query.filter(
            (Recipe.title.ilike(f"%{search_lower}%")) |
            (Recipe.id.in_(ingredient_ids))
        )
    
    recipes = query.order_by(Recipe.id).all()
    
    # Вычисляем рейтинг для каждого рецепта
    result = []
    for recipe in recipes:
        # Подсчитываем средний рейтинг из отзывов
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.recipe_id == recipe.id
        ).scalar()
        
        recipe_dict = {
            "id": recipe.id,
            "title": recipe.title,
            "category": recipe.category,
            "cook_time": recipe.cook_time,
            "servings": recipe.servings,
            "image": recipe.image,
            "calories_per_serving": recipe.calories_per_serving,
            "rating": float(avg_rating) if avg_rating else None
        }
        result.append(RecipeListItem(**recipe_dict))
    
    return result


@app.get("/api/recipes/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Получить детали рецепта по ID"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Вычисляем средний рейтинг
    avg_rating = db.query(func.avg(Review.rating)).filter(
        Review.recipe_id == recipe.id
    ).scalar()
    
    # Загружаем связанные данные
    db.refresh(recipe)
    
    recipe_dict = {
        "id": recipe.id,
        "title": recipe.title,
        "category": recipe.category,
        "cook_time": recipe.cook_time,
        "servings": recipe.servings,
        "image": recipe.image,
        "calories_per_serving": recipe.calories_per_serving,
        "rating": float(avg_rating) if avg_rating else None,
        "ingredients": recipe.ingredients,
        "steps": recipe.steps,
        "reviews": recipe.reviews
    }
    
    return RecipeResponse(**recipe_dict)


@app.post("/api/recipes/{recipe_id}/reviews", response_model=ReviewResponse)
async def add_review(
    recipe_id: int,
    review: ReviewCreate,
    db: Session = Depends(get_db)
):
    """Добавить отзыв к рецепту"""
    # Проверяем существование рецепта
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Создаем новый отзыв
    new_review = Review(
        recipe_id=recipe_id,
        author=review.author,
        rating=review.rating,
        comment=review.comment,
        date=review.date,
        image=review.image
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return ReviewResponse(
        id=new_review.id,
        recipe_id=new_review.recipe_id,
        author=new_review.author,
        rating=new_review.rating,
        comment=new_review.comment,
        date=new_review.date,
        image=new_review.image
    )


# ========== MenuPlan Endpoints ==========

@app.get("/api/menu-plans", response_model=List[MenuPlanResponse])
async def get_menu_plans(
    start_date: Optional[date] = Query(None, description="Начальная дата"),
    end_date: Optional[date] = Query(None, description="Конечная дата"),
    db: Session = Depends(get_db)
):
    """Получить меню планы с фильтрацией по дате"""
    query = db.query(MenuPlan)
    
    if start_date:
        query = query.filter(MenuPlan.date >= start_date)
    if end_date:
        query = query.filter(MenuPlan.date <= end_date)
    
    menu_plans = query.order_by(MenuPlan.date).all()
    
    result = []
    for plan in menu_plans:
        plan_dict = {
            "id": plan.id,
            "date": plan.date,
            "user_id": plan.user_id,
            "breakfast_recipe_id": plan.breakfast_recipe_id,
            "lunch_recipe_id": plan.lunch_recipe_id,
            "dinner_recipe_id": plan.dinner_recipe_id,
            "extra_recipe_id": plan.extra_recipe_id,
            "breakfast_recipe": None,
            "lunch_recipe": None,
            "dinner_recipe": None,
            "extra_recipe": None,
            "additional_recipes": []
        }
        
        # Загружаем рецепты если они есть
        if plan.breakfast_recipe:
            avg_rating = db.query(func.avg(Review.rating)).filter(
                Review.recipe_id == plan.breakfast_recipe.id
            ).scalar()
            plan_dict["breakfast_recipe"] = RecipeListItem(
                id=plan.breakfast_recipe.id,
                title=plan.breakfast_recipe.title,
                category=plan.breakfast_recipe.category,
                cook_time=plan.breakfast_recipe.cook_time,
                servings=plan.breakfast_recipe.servings,
                image=plan.breakfast_recipe.image,
                calories_per_serving=plan.breakfast_recipe.calories_per_serving,
                rating=float(avg_rating) if avg_rating else None
            )
        
        if plan.lunch_recipe:
            avg_rating = db.query(func.avg(Review.rating)).filter(
                Review.recipe_id == plan.lunch_recipe.id
            ).scalar()
            plan_dict["lunch_recipe"] = RecipeListItem(
                id=plan.lunch_recipe.id,
                title=plan.lunch_recipe.title,
                category=plan.lunch_recipe.category,
                cook_time=plan.lunch_recipe.cook_time,
                servings=plan.lunch_recipe.servings,
                image=plan.lunch_recipe.image,
                calories_per_serving=plan.lunch_recipe.calories_per_serving,
                rating=float(avg_rating) if avg_rating else None
            )
        
        if plan.dinner_recipe:
            avg_rating = db.query(func.avg(Review.rating)).filter(
                Review.recipe_id == plan.dinner_recipe.id
            ).scalar()
            plan_dict["dinner_recipe"] = RecipeListItem(
                id=plan.dinner_recipe.id,
                title=plan.dinner_recipe.title,
                category=plan.dinner_recipe.category,
                cook_time=plan.dinner_recipe.cook_time,
                servings=plan.dinner_recipe.servings,
                image=plan.dinner_recipe.image,
                calories_per_serving=plan.dinner_recipe.calories_per_serving,
                rating=float(avg_rating) if avg_rating else None
            )
        
        if plan.extra_recipe:
            avg_rating = db.query(func.avg(Review.rating)).filter(
                Review.recipe_id == plan.extra_recipe.id
            ).scalar()
            plan_dict["extra_recipe"] = RecipeListItem(
                id=plan.extra_recipe.id,
                title=plan.extra_recipe.title,
                category=plan.extra_recipe.category,
                cook_time=plan.extra_recipe.cook_time,
                servings=plan.extra_recipe.servings,
                image=plan.extra_recipe.image,
                calories_per_serving=plan.extra_recipe.calories_per_serving,
                rating=float(avg_rating) if avg_rating else None
            )
        
        # Загружаем дополнительные рецепты
        additional_recipes = []
        for additional in sorted(plan.additional_recipes, key=lambda x: x.order):
            avg_rating = db.query(func.avg(Review.rating)).filter(
                Review.recipe_id == additional.recipe.id
            ).scalar()
            additional_recipes.append(RecipeListItem(
                id=additional.recipe.id,
                title=additional.recipe.title,
                category=additional.recipe.category,
                cook_time=additional.recipe.cook_time,
                servings=additional.recipe.servings,
                image=additional.recipe.image,
                calories_per_serving=additional.recipe.calories_per_serving,
                rating=float(avg_rating) if avg_rating else None
            ))
        plan_dict["additional_recipes"] = additional_recipes
        
        result.append(MenuPlanResponse(**plan_dict))
    
    return result


@app.post("/api/menu-plans", response_model=MenuPlanResponse)
async def save_menu_plan(
    menu_plan: MenuPlanCreate,
    db: Session = Depends(get_db)
):
    """Создать или обновить меню план"""
    # Проверяем существование рецептов если они указаны
    recipe_ids = [
        menu_plan.breakfast_recipe_id,
        menu_plan.lunch_recipe_id,
        menu_plan.dinner_recipe_id,
        menu_plan.extra_recipe_id
    ]
    if menu_plan.additional_recipe_ids:
        recipe_ids.extend(menu_plan.additional_recipe_ids)
    
    for recipe_id in recipe_ids:
        if recipe_id:
            recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
            if not recipe:
                raise HTTPException(
                    status_code=404,
                    detail=f"Recipe with id {recipe_id} not found"
                )
    
    # Ищем существующий план на эту дату
    existing_plan = db.query(MenuPlan).filter(
        MenuPlan.date == menu_plan.date
    ).first()
    
    if existing_plan:
        # Обновляем существующий план
        existing_plan.user_id = menu_plan.user_id
        existing_plan.breakfast_recipe_id = menu_plan.breakfast_recipe_id
        existing_plan.lunch_recipe_id = menu_plan.lunch_recipe_id
        existing_plan.dinner_recipe_id = menu_plan.dinner_recipe_id
        existing_plan.extra_recipe_id = menu_plan.extra_recipe_id
        existing_plan.updated_at = datetime.utcnow()
        
        # Удаляем старые дополнительные рецепты
        db.query(MenuPlanAdditional).filter(
            MenuPlanAdditional.menu_plan_id == existing_plan.id
        ).delete()
        
        # Добавляем новые дополнительные рецепты
        if menu_plan.additional_recipe_ids:
            for order, recipe_id in enumerate(menu_plan.additional_recipe_ids):
                additional = MenuPlanAdditional(
                    menu_plan_id=existing_plan.id,
                    recipe_id=recipe_id,
                    order=order
                )
                db.add(additional)
        
        db.commit()
        db.refresh(existing_plan)
        plan = existing_plan
    else:
        # Создаем новый план
        new_plan = MenuPlan(
            date=menu_plan.date,
            user_id=menu_plan.user_id,
            breakfast_recipe_id=menu_plan.breakfast_recipe_id,
            lunch_recipe_id=menu_plan.lunch_recipe_id,
            dinner_recipe_id=menu_plan.dinner_recipe_id,
            extra_recipe_id=menu_plan.extra_recipe_id
        )
        db.add(new_plan)
        db.flush()  # Получаем ID нового плана
        
        # Добавляем дополнительные рецепты
        if menu_plan.additional_recipe_ids:
            for order, recipe_id in enumerate(menu_plan.additional_recipe_ids):
                additional = MenuPlanAdditional(
                    menu_plan_id=new_plan.id,
                    recipe_id=recipe_id,
                    order=order
                )
                db.add(additional)
        
        db.commit()
        db.refresh(new_plan)
        plan = new_plan
    
    # Формируем ответ
    plan_dict = {
        "id": plan.id,
        "date": plan.date,
        "user_id": plan.user_id,
        "breakfast_recipe_id": plan.breakfast_recipe_id,
        "lunch_recipe_id": plan.lunch_recipe_id,
        "dinner_recipe_id": plan.dinner_recipe_id,
        "extra_recipe_id": plan.extra_recipe_id,
        "breakfast_recipe": None,
        "lunch_recipe": None,
        "dinner_recipe": None,
        "extra_recipe": None,
        "additional_recipes": []
    }
    
    # Загружаем рецепты
    if plan.breakfast_recipe:
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.recipe_id == plan.breakfast_recipe.id
        ).scalar()
        plan_dict["breakfast_recipe"] = RecipeListItem(
            id=plan.breakfast_recipe.id,
            title=plan.breakfast_recipe.title,
            category=plan.breakfast_recipe.category,
            cook_time=plan.breakfast_recipe.cook_time,
            servings=plan.breakfast_recipe.servings,
            image=plan.breakfast_recipe.image,
            calories_per_serving=plan.breakfast_recipe.calories_per_serving,
            rating=float(avg_rating) if avg_rating else None
        )
    
    if plan.lunch_recipe:
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.recipe_id == plan.lunch_recipe.id
        ).scalar()
        plan_dict["lunch_recipe"] = RecipeListItem(
            id=plan.lunch_recipe.id,
            title=plan.lunch_recipe.title,
            category=plan.lunch_recipe.category,
            cook_time=plan.lunch_recipe.cook_time,
            servings=plan.lunch_recipe.servings,
            image=plan.lunch_recipe.image,
            calories_per_serving=plan.lunch_recipe.calories_per_serving,
            rating=float(avg_rating) if avg_rating else None
        )
    
    if plan.dinner_recipe:
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.recipe_id == plan.dinner_recipe.id
        ).scalar()
        plan_dict["dinner_recipe"] = RecipeListItem(
            id=plan.dinner_recipe.id,
            title=plan.dinner_recipe.title,
            category=plan.dinner_recipe.category,
            cook_time=plan.dinner_recipe.cook_time,
            servings=plan.dinner_recipe.servings,
            image=plan.dinner_recipe.image,
            calories_per_serving=plan.dinner_recipe.calories_per_serving,
            rating=float(avg_rating) if avg_rating else None
        )
    
    if plan.extra_recipe:
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.recipe_id == plan.extra_recipe.id
        ).scalar()
        plan_dict["extra_recipe"] = RecipeListItem(
            id=plan.extra_recipe.id,
            title=plan.extra_recipe.title,
            category=plan.extra_recipe.category,
            cook_time=plan.extra_recipe.cook_time,
            servings=plan.extra_recipe.servings,
            image=plan.extra_recipe.image,
            calories_per_serving=plan.extra_recipe.calories_per_serving,
            rating=float(avg_rating) if avg_rating else None
        )
    
    # Загружаем дополнительные рецепты
    additional_recipes = []
    for additional in sorted(plan.additional_recipes, key=lambda x: x.order):
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.recipe_id == additional.recipe.id
        ).scalar()
        additional_recipes.append(RecipeListItem(
            id=additional.recipe.id,
            title=additional.recipe.title,
            category=additional.recipe.category,
            cook_time=additional.recipe.cook_time,
            servings=additional.recipe.servings,
            image=additional.recipe.image,
            calories_per_serving=additional.recipe.calories_per_serving,
            rating=float(avg_rating) if avg_rating else None
        ))
    plan_dict["additional_recipes"] = additional_recipes
    
    return MenuPlanResponse(**plan_dict)


@app.delete("/api/menu-plans/{plan_date}")
async def delete_menu_plan(plan_date: date, db: Session = Depends(get_db)):
    """Удалить меню план по дате"""
    plan = db.query(MenuPlan).filter(MenuPlan.date == plan_date).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Menu plan not found")
    
    db.delete(plan)
    db.commit()
    
    return {"message": "Menu plan deleted successfully"}


# ========== UserIngredient Endpoints ==========

@app.get("/api/user-ingredients", response_model=List[UserIngredientResponse])
async def get_user_ingredients(
    user_id: Optional[str] = Query("default", description="ID пользователя"),
    db: Session = Depends(get_db)
):
    """Получить ингредиенты пользователя"""
    ingredients = db.query(UserIngredient).filter(
        UserIngredient.user_id == user_id
    ).all()
    return ingredients


@app.post("/api/user-ingredients", response_model=UserIngredientResponse)
async def save_user_ingredient(
    ingredient: UserIngredientCreate,
    db: Session = Depends(get_db)
):
    """Создать или обновить ингредиент пользователя"""
    user_id = ingredient.user_id or "default"
    
    # Ищем существующий ингредиент
    existing = db.query(UserIngredient).filter(
        UserIngredient.user_id == user_id,
        UserIngredient.name == ingredient.name
    ).first()
    
    if existing:
        # Обновляем существующий
        existing.quantity = ingredient.quantity
        existing.price = ingredient.price
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Создаем новый
        new_ingredient = UserIngredient(
            user_id=user_id,
            name=ingredient.name,
            quantity=ingredient.quantity,
            price=ingredient.price
        )
        db.add(new_ingredient)
        db.commit()
        db.refresh(new_ingredient)
        return new_ingredient


@app.post("/api/user-ingredients/batch", response_model=List[UserIngredientResponse])
async def save_user_ingredients_batch(
    ingredients: List[UserIngredientCreate],
    user_id: Optional[str] = Query("default", description="ID пользователя"),
    db: Session = Depends(get_db)
):
    """Сохранить несколько ингредиентов пользователя за раз"""
    result = []
    for ingredient in ingredients:
        current_user_id = ingredient.user_id or user_id
        
        # Ищем существующий ингредиент
        existing = db.query(UserIngredient).filter(
            UserIngredient.user_id == current_user_id,
            UserIngredient.name == ingredient.name
        ).first()
        
        if existing:
            # Обновляем существующий
            existing.quantity = ingredient.quantity
            existing.price = ingredient.price
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            result.append(existing)
        else:
            # Создаем новый
            new_ingredient = UserIngredient(
                user_id=current_user_id,
                name=ingredient.name,
                quantity=ingredient.quantity,
                price=ingredient.price
            )
            db.add(new_ingredient)
            db.commit()
            db.refresh(new_ingredient)
            result.append(new_ingredient)
    
    return result


@app.delete("/api/user-ingredients/{ingredient_name}")
async def delete_user_ingredient(
    ingredient_name: str,
    user_id: Optional[str] = Query("default", description="ID пользователя"),
    db: Session = Depends(get_db)
):
    """Удалить ингредиент пользователя"""
    ingredient = db.query(UserIngredient).filter(
        UserIngredient.user_id == user_id,
        UserIngredient.name == ingredient_name
    ).first()
    
    if not ingredient:
        raise HTTPException(status_code=404, detail="User ingredient not found")
    
    db.delete(ingredient)
    db.commit()
    
    return {"message": "User ingredient deleted successfully"}


# ========== PurchasedItem Endpoints ==========

@app.get("/api/purchased-items", response_model=List[PurchasedItemResponse])
async def get_purchased_items(
    user_id: Optional[str] = Query("default", description="ID пользователя"),
    tab_key: Optional[str] = Query(None, description="Фильтр по вкладке (tomorrow/week/month)"),
    db: Session = Depends(get_db)
):
    """Получить список купленных продуктов"""
    query = db.query(PurchasedItem).filter(
        PurchasedItem.user_id == user_id,
        PurchasedItem.purchased == 1
    )
    
    if tab_key:
        query = query.filter(PurchasedItem.tab_key == tab_key)
    
    items = query.all()
    return items


@app.post("/api/purchased-items", response_model=PurchasedItemResponse)
async def toggle_purchased_item(
    item: PurchasedItemCreate,
    db: Session = Depends(get_db)
):
    """Создать или обновить статус купленного продукта"""
    user_id = item.user_id or "default"
    
    # Ищем существующую запись
    existing = db.query(PurchasedItem).filter(
        PurchasedItem.user_id == user_id,
        PurchasedItem.item_name == item.item_name,
        PurchasedItem.tab_key == item.tab_key
    ).first()
    
    if existing:
        # Обновляем существующую
        existing.purchased = item.purchased
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Создаем новую
        new_item = PurchasedItem(
            user_id=user_id,
            item_name=item.item_name,
            tab_key=item.tab_key,
            purchased=item.purchased
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item


@app.post("/api/purchased-items/batch", response_model=List[PurchasedItemResponse])
async def save_purchased_items_batch(
    items: List[PurchasedItemCreate],
    user_id: Optional[str] = Query("default", description="ID пользователя"),
    db: Session = Depends(get_db)
):
    """Сохранить несколько купленных продуктов за раз"""
    result = []
    for item in items:
        current_user_id = item.user_id or user_id
        
        # Ищем существующую запись
        existing = db.query(PurchasedItem).filter(
            PurchasedItem.user_id == current_user_id,
            PurchasedItem.item_name == item.item_name,
            PurchasedItem.tab_key == item.tab_key
        ).first()
        
        if existing:
            # Обновляем существующую
            existing.purchased = item.purchased
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            result.append(existing)
        else:
            # Создаем новую
            new_item = PurchasedItem(
                user_id=current_user_id,
                item_name=item.item_name,
                tab_key=item.tab_key,
                purchased=item.purchased
            )
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            result.append(new_item)
    
    return result


@app.delete("/api/purchased-items")
async def clear_purchased_items(
    user_id: Optional[str] = Query("default", description="ID пользователя"),
    tab_key: Optional[str] = Query(None, description="Фильтр по вкладке (tomorrow/week/month)"),
    db: Session = Depends(get_db)
):
    """Удалить все купленные продукты (или для конкретной вкладки)"""
    query = db.query(PurchasedItem).filter(
        PurchasedItem.user_id == user_id
    )
    
    if tab_key:
        query = query.filter(PurchasedItem.tab_key == tab_key)
    
    query.delete()
    db.commit()
    
    return {"message": "Purchased items deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
