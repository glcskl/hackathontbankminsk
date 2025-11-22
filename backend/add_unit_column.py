"""
Скрипт для добавления колонки unit в таблицу user_ingredients
"""
from sqlalchemy import text
from database import SessionLocal

def add_unit_column():
    """Добавляет колонку unit в таблицу user_ingredients если её нет"""
    db = SessionLocal()
    try:
        # Проверяем, существует ли колонка
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='user_ingredients' AND column_name='unit'
        """))
        
        if result.fetchone() is None:
            print("Добавление колонки unit в таблицу user_ingredients...")
            # Добавляем колонку
            db.execute(text("""
                ALTER TABLE user_ingredients 
                ADD COLUMN unit VARCHAR(50)
            """))
            db.commit()
            print("Колонка unit успешно добавлена!")
        else:
            print("Колонка unit уже существует.")
            
    except Exception as e:
        db.rollback()
        print(f"Ошибка при добавлении колонки unit: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_unit_column()

