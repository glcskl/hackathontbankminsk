"""
Скрипт для обновления изображений в шагах приготовления
"""
from database import SessionLocal, init_db
from models import Recipe, Step
import sys


def update_step_images():
    """Обновляет изображения для всех шагов приготовления"""
    init_db()
    
    db = SessionLocal()
    
    try:
        # Получаем все рецепты
        recipes = db.query(Recipe).all()
        
        # Словарь с изображениями для каждого рецепта
        step_images = {
            "Американские панкейки": [
                "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhpbmclMjBmbG91ciUyMGluZ3JlZGllbnRzfGVufDF8fHx8MTc2MzgwNzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1740836257337-0d4fd26db36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5jYWtlcyUyMGNvb2tpbmclMjBwcm9jZXNzfGVufDF8fHx8MTc2MzgwNzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
            ],
            "Паста Болоньезе": [
                "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1612078960243-177e68303e7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwcGFzdElMjBzYXVjZXxlbnwxfHx8fDE3NjM4MDc2ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                "https://images.unsplash.com/photo-1622973536968-3ead9e780960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            ],
            "Омлет с овощами": [
                "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1668283653825-37b80f055b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1668283653825-37b80f055b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            ],
            "Лосось на гриле": [
                "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1589236103748-2077d3435dbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2FsbW9uJTIwY29va2luZ3xlbnwxfHx8fDE3NjM4MDc2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                "https://images.unsplash.com/photo-1589236103748-2077d3435dbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            ],
            "Салат Цезарь": [
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            ],
            "Шоколадный торт": [
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
                "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            ],
        }
        
        updated_count = 0
        
        for recipe in recipes:
            if recipe.title in step_images:
                steps = db.query(Step).filter(Step.recipe_id == recipe.id).order_by(Step.order).all()
                images = step_images[recipe.title]
                
                for i, step in enumerate(steps):
                    if i < len(images):
                        step.image = images[i]
                        updated_count += 1
        
        db.commit()
        print(f"Успешно обновлено изображений для шагов: {updated_count}")
        
    except Exception as e:
        db.rollback()
        print(f"Ошибка при обновлении изображений: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_step_images()

