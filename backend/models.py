from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    cook_time = Column(Integer, nullable=False)  # в минутах
    servings = Column(Integer, nullable=False)
    image = Column(Text, nullable=True)
    calories_per_serving = Column(Integer, nullable=True)
    rating = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ingredients = relationship("Ingredient", back_populates="recipe", cascade="all, delete-orphan", order_by="Ingredient.order")
    steps = relationship("Step", back_populates="recipe", cascade="all, delete-orphan", order_by="Step.order")
    reviews = relationship("Review", back_populates="recipe", cascade="all, delete-orphan")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    name = Column(String(255), nullable=False)
    amount = Column(String(50), nullable=False)
    unit = Column(String(50), nullable=False)
    order = Column(Integer, nullable=False, default=0)

    # Relationships
    recipe = relationship("Recipe", back_populates="ingredients")


class Step(Base):
    __tablename__ = "steps"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    number = Column(Integer, nullable=False)
    instruction = Column(Text, nullable=False)
    image = Column(Text, nullable=True)
    order = Column(Integer, nullable=False, default=0)

    # Relationships
    recipe = relationship("Recipe", back_populates="steps")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    author = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=False)
    date = Column(String(50), nullable=False)  # Формат: "15 ноя 2024"
    image = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    recipe = relationship("Recipe", back_populates="reviews")


class MenuPlan(Base):
    __tablename__ = "menu_plans"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True, index=True)
    user_id = Column(String(100), nullable=True)  # Для будущего расширения
    breakfast_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    lunch_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    dinner_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    extra_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    breakfast_recipe = relationship("Recipe", foreign_keys=[breakfast_recipe_id])
    lunch_recipe = relationship("Recipe", foreign_keys=[lunch_recipe_id])
    dinner_recipe = relationship("Recipe", foreign_keys=[dinner_recipe_id])
    extra_recipe = relationship("Recipe", foreign_keys=[extra_recipe_id])
    additional_recipes = relationship("MenuPlanAdditional", back_populates="menu_plan", cascade="all, delete-orphan", order_by="MenuPlanAdditional.order")


class MenuPlanAdditional(Base):
    __tablename__ = "menu_plan_additional"

    id = Column(Integer, primary_key=True, index=True)
    menu_plan_id = Column(Integer, ForeignKey("menu_plans.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    menu_plan = relationship("MenuPlan", back_populates="additional_recipes")
    recipe = relationship("Recipe")


class UserIngredient(Base):
    __tablename__ = "user_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=True, default="default")  # Для будущего расширения
    name = Column(String(255), nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=0)
    price = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Уникальный индекс для комбинации user_id и name
    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uq_user_ingredient'),
    )


class PurchasedItem(Base):
    __tablename__ = "purchased_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=True, default="default")  # Для будущего расширения
    item_name = Column(String(255), nullable=False, index=True)
    tab_key = Column(String(50), nullable=False)  # 'tomorrow', 'week', 'month'
    purchased = Column(Integer, nullable=False, default=1)  # 1 = purchased, 0 = not purchased
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Уникальный индекс для комбинации user_id, item_name и tab_key
    __table_args__ = (
        UniqueConstraint('user_id', 'item_name', 'tab_key', name='uq_purchased_item'),
    )

