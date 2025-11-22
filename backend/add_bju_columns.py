"""
Скрипт для добавления колонок БЖУ (белки, жиры, углеводы) в таблицу recipes
"""
from sqlalchemy import text
from database import SessionLocal

def add_bju_columns():
    """Добавляет колонки БЖУ в таблицу recipes если их нет"""
    db = SessionLocal()
    try:
        # Проверяем и добавляем колонку proteins_per_serving
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='recipes' AND column_name='proteins_per_serving'
        """))
        
        if result.fetchone() is None:
            print("Добавление колонки proteins_per_serving в таблицу recipes...")
            db.execute(text("""
                ALTER TABLE recipes 
                ADD COLUMN proteins_per_serving FLOAT
            """))
            db.commit()
            print("Колонка proteins_per_serving успешно добавлена!")
        else:
            print("Колонка proteins_per_serving уже существует.")
        
        # Проверяем и добавляем колонку fats_per_serving
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='recipes' AND column_name='fats_per_serving'
        """))
        
        if result.fetchone() is None:
            print("Добавление колонки fats_per_serving в таблицу recipes...")
            db.execute(text("""
                ALTER TABLE recipes 
                ADD COLUMN fats_per_serving FLOAT
            """))
            db.commit()
            print("Колонка fats_per_serving успешно добавлена!")
        else:
            print("Колонка fats_per_serving уже существует.")
        
        # Проверяем и добавляем колонку carbohydrates_per_serving
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='recipes' AND column_name='carbohydrates_per_serving'
        """))
        
        if result.fetchone() is None:
            print("Добавление колонки carbohydrates_per_serving в таблицу recipes...")
            db.execute(text("""
                ALTER TABLE recipes 
                ADD COLUMN carbohydrates_per_serving FLOAT
            """))
            db.commit()
            print("Колонка carbohydrates_per_serving успешно добавлена!")
        else:
            print("Колонка carbohydrates_per_serving уже существует.")
            
    except Exception as e:
        db.rollback()
        print(f"Ошибка при добавлении колонок БЖУ: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_bju_columns()

