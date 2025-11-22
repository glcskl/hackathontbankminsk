# Backend API

FastAPI backend для VibeCoders Solution.

## Установка

```bash
# Создать виртуальное окружение
python -m venv venv

# Активировать виртуальное окружение
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt
```

## Запуск

### Локально

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Через Docker

```bash
docker-compose up backend
```

## API Endpoints

- `GET /` - Главная страница
- `GET /health` - Проверка здоровья сервиса
- `GET /items` - Получить все элементы
- `GET /items/{item_id}` - Получить элемент по ID
- `POST /items` - Создать новый элемент
- `PUT /items/{item_id}` - Обновить элемент
- `DELETE /items/{item_id}` - Удалить элемент

## Документация API

После запуска сервера доступна автоматическая документация:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Переменные окружения

- `DATABASE_URL` - URL подключения к PostgreSQL
- `PORT` - Порт для запуска сервера (по умолчанию 8000)
- `DEBUG` - Режим отладки (True/False)

