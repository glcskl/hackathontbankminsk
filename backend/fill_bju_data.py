"""
Скрипт для заполнения БЖУ для существующих рецептов в базе данных
"""
from database import SessionLocal
from models import Recipe
from sqlalchemy import text

# Словарь с БЖУ для каждого рецепта (на 1 порцию)
# Формат: {название_рецепта: (белки, жиры, углеводы)}
BJU_DATA = {
    "Американские панкейки": {
        "proteins": 7.5,
        "fats": 8.0,
        "carbohydrates": 30.0
    },
    "Паста Болоньезе": {
        "proteins": 28.0,
        "fats": 18.0,
        "carbohydrates": 55.0
    },
    "Омлет с овощами": {
        "proteins": 12.0,
        "fats": 12.0,
        "carbohydrates": 6.0
    },
    "Лосось на гриле": {
        "proteins": 35.0,
        "fats": 18.0,
        "carbohydrates": 2.0
    },
    "Салат Цезарь": {
        "proteins": 25.0,
        "fats": 22.0,
        "carbohydrates": 15.0
    },
    "Шоколадный торт": {
        "proteins": 6.5,
        "fats": 22.0,
        "carbohydrates": 58.0
    }
}


def fill_bju_data():
    """Заполняет БЖУ для существующих рецептов"""
    db = SessionLocal()
    
    try:
        # Сначала убедимся, что колонки существуют
        print("Проверка наличия колонок БЖУ...")
        try:
            db.execute(text("SELECT proteins_per_serving FROM recipes LIMIT 1"))
            print("Колонки БЖУ уже существуют.")
        except Exception as e:
            print(f"Колонки БЖУ не найдены. Запустите сначала add_bju_columns.py")
            return
        
        # Получаем все рецепты
        recipes = db.query(Recipe).all()
        print(f"\nНайдено рецептов: {len(recipes)}")
        
        updated_count = 0
        
        for recipe in recipes:
            if recipe.title in BJU_DATA:
                bju = BJU_DATA[recipe.title]
                recipe.proteins_per_serving = bju["proteins"]
                recipe.fats_per_serving = bju["fats"]
                recipe.carbohydrates_per_serving = bju["carbohydrates"]
                updated_count += 1
                print(f"✓ Обновлен: {recipe.title}")
                print(f"  Б: {bju['proteins']}г, Ж: {bju['fats']}г, У: {bju['carbohydrates']}г")
            else:
                print(f"⚠ Пропущен (нет данных БЖУ): {recipe.title}")
        
        # Сохраняем изменения
        db.commit()
        print(f"\n✓ Успешно обновлено рецептов: {updated_count}")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Ошибка при заполнении БЖУ: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    fill_bju_data()

