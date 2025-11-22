"""
Скрипт для добавления колонки user_id в таблицу recipes
"""
from sqlalchemy import text
from database import SessionLocal, engine

def add_user_id_column():
    """Добавляет колонку user_id в таблицу recipes если её нет"""
    db = SessionLocal()
    try:
        # Проверяем, существует ли колонка
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='recipes' AND column_name='user_id'
        """))
        
        if result.fetchone() is None:
            print("Добавление колонки user_id в таблицу recipes...")
            # Добавляем колонку
            db.execute(text("""
                ALTER TABLE recipes 
                ADD COLUMN user_id VARCHAR(100)
            """))
            db.commit()
            print("Колонка user_id успешно добавлена!")
        else:
            print("Колонка user_id уже существует.")
        
        # Создаем индекс для user_id если его нет
        result = db.execute(text("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename='recipes' AND indexname LIKE '%user_id%'
        """))
        
        if result.fetchone() is None:
            print("Создание индекса для user_id...")
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS ix_recipes_user_id ON recipes(user_id)
            """))
            db.commit()
            print("Индекс для user_id успешно создан!")
        else:
            print("Индекс для user_id уже существует.")
            
    except Exception as e:
        db.rollback()
        print(f"Ошибка при добавлении колонки user_id: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_user_id_column()

