from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


# Ingredient schemas
class IngredientBase(BaseModel):
    name: str
    amount: str
    unit: str


class IngredientCreate(IngredientBase):
    pass


class IngredientResponse(IngredientBase):
    id: int
    recipe_id: int
    order: int

    class Config:
        from_attributes = True


# Step schemas
class StepBase(BaseModel):
    number: int
    instruction: str
    image: Optional[str] = None


class StepCreate(StepBase):
    pass


class StepResponse(StepBase):
    id: int
    recipe_id: int
    order: int

    class Config:
        from_attributes = True


# Review schemas
class ReviewBase(BaseModel):
    author: str
    rating: int = Field(..., ge=1, le=5)
    comment: str
    date: str
    image: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    recipe_id: int

    class Config:
        from_attributes = True


# Recipe schemas
class RecipeBase(BaseModel):
    title: str
    category: str
    cook_time: int
    servings: int
    image: Optional[str] = None
    calories_per_serving: Optional[int] = None


class RecipeCreate(RecipeBase):
    ingredients: List[IngredientCreate]
    steps: List[StepCreate]


class RecipeResponse(RecipeBase):
    id: int
    rating: Optional[float] = None
    ingredients: List[IngredientResponse]
    steps: List[StepResponse]
    reviews: Optional[List[ReviewResponse]] = []

    class Config:
        from_attributes = True


class RecipeListItem(BaseModel):
    """Упрощенная версия рецепта для списка"""
    id: int
    title: str
    category: str
    cook_time: int
    servings: int
    image: Optional[str] = None
    calories_per_serving: Optional[int] = None
    rating: Optional[float] = None

    class Config:
        from_attributes = True


# MenuPlan schemas
class MenuPlanBase(BaseModel):
    date: date
    user_id: Optional[str] = None
    breakfast_recipe_id: Optional[int] = None
    lunch_recipe_id: Optional[int] = None
    dinner_recipe_id: Optional[int] = None
    extra_recipe_id: Optional[int] = None
    additional_recipe_ids: Optional[List[int]] = []


class MenuPlanCreate(MenuPlanBase):
    pass


class MenuPlanResponse(MenuPlanBase):
    id: int
    breakfast_recipe: Optional[RecipeListItem] = None
    lunch_recipe: Optional[RecipeListItem] = None
    dinner_recipe: Optional[RecipeListItem] = None
    extra_recipe: Optional[RecipeListItem] = None
    additional_recipes: Optional[List[RecipeListItem]] = []

    class Config:
        from_attributes = True


# UserIngredient schemas
class UserIngredientBase(BaseModel):
    name: str
    quantity: float
    price: float


class UserIngredientCreate(UserIngredientBase):
    user_id: Optional[str] = None


class UserIngredientResponse(UserIngredientBase):
    id: int
    user_id: Optional[str] = None

    class Config:
        from_attributes = True

