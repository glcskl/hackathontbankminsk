"""
Скрипт для инициализации базы данных
Создает все таблицы если их еще нет
"""
from database import init_db
import sys

if __name__ == "__main__":
    try:
        print("Инициализация базы данных...")
        init_db()
        print("База данных успешно инициализирована!")
    except Exception as e:
        print(f"Ошибка при инициализации базы данных: {e}", file=sys.stderr)
        sys.exit(1)

