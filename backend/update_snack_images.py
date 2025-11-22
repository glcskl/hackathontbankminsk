"""
Скрипт для обновления изображений рецептов закусок
"""
from database import SessionLocal
from models import Recipe, Step
import sys

# Рабочие изображения для каждого рецепта закусок
# Используем формат с полными параметрами, как в других рецептах
SNACK_IMAGES = {
    "Брускетта с томатами и базиликом": "https://images.unsplash.com/photo-1622973536968-3ead9e780960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGJvbG9nbmVzZXxlbnwxfHx8fDE3NjM3NzI0MDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "Гуакамоле": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZHxlbnwxfHx8fDE3NjM3NzMyOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "Сырные шарики с орехами": "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjYWtlfGVufDF8fHx8MTc2MzcxMjQxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    "Оливки с сыром и травами": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZHxlbnwxfHx8fDE3NjM3NzMyOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
}

# Изображения для шагов приготовления (в том же формате, что и другие рецепты)
STEP_IMAGES = {
    "Брускетта с томатами и базиликом": [
        "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Нарезка хлеба
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Обжарка хлеба
        "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Натирание чесноком
        "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Подготовка томатов
        "https://images.unsplash.com/photo-1572441713132-51c75654db73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Готовая брускетта
    ],
    "Гуакамоле": [
        "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Авокадо
        "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Разминание
        "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Лимон
        "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Нарезка овощей
        "https://images.unsplash.com/photo-1589164668747-cc0b0a5e4c0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Готовое гуакамоле
    ],
    "Сырные шарики с орехами": [
        "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Сливочный сыр
        "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Терка сыра
        "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Нарезка и орехи
        "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Смешивание
        "https://images.unsplash.com/photo-1618164436266-4465e5fc9e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Готовые шарики
    ],
    "Оливки с сыром и травами": [
        "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Оливки
        "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Нарезка сыра
        "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Заправка
        "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Смешивание
        "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",  # Готовое блюдо
    ],
}


def update_snack_images():
    """Обновляет изображения для рецептов закусок"""
    db = SessionLocal()
    
    try:
        snacks = db.query(Recipe).filter(Recipe.category == "Закуски").all()
        
        if not snacks:
            print("Рецепты закусок не найдены в базе данных.")
            return
        
        updated_count = 0
        
        for recipe in snacks:
            if recipe.title in SNACK_IMAGES:
                # Обновляем основное изображение рецепта
                old_image = recipe.image
                recipe.image = SNACK_IMAGES[recipe.title]
                print(f"Обновлено изображение для '{recipe.title}'")
                
                # Обновляем изображения для шагов приготовления
                if recipe.title in STEP_IMAGES:
                    steps = db.query(Step).filter(Step.recipe_id == recipe.id).order_by(Step.order).all()
                    step_images = STEP_IMAGES[recipe.title]
                    
                    for i, step in enumerate(steps):
                        if i < len(step_images):
                            step.image = step_images[i]
                    
                    print(f"  Обновлено {len(steps)} изображений для шагов")
                
                updated_count += 1
        
        db.commit()
        print(f"\nУспешно обновлено изображений для {updated_count} рецептов закусок!")
        
    except Exception as e:
        db.rollback()
        print(f"Ошибка при обновлении изображений: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_snack_images()

