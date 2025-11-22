from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(
    title="VibeCoders API",
    description="Backend API for VibeCoders Solution",
    version="1.0.0"
)

# CORS middleware для работы с Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модели данных
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None

# In-memory хранилище (в продакшене использовать БД)
items_db: List[Item] = []
next_id = 1

@app.get("/")
async def root():
    return {
        "message": "Welcome to VibeCoders API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/items", response_model=List[Item])
async def get_items():
    """Получить все элементы"""
    return items_db

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    """Получить элемент по ID"""
    item = next((item for item in items_db if item.id == item_id), None)
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.post("/items", response_model=Item)
async def create_item(item: ItemCreate):
    """Создать новый элемент"""
    global next_id
    new_item = Item(
        id=next_id,
        name=item.name,
        description=item.description
    )
    items_db.append(new_item)
    next_id += 1
    return new_item

@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: ItemCreate):
    """Обновить элемент"""
    existing_item = next((item for item in items_db if item.id == item_id), None)
    if not existing_item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")
    
    existing_item.name = item.name
    existing_item.description = item.description
    return existing_item

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """Удалить элемент"""
    global items_db
    item = next((item for item in items_db if item.id == item_id), None)
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")
    
    items_db = [item for item in items_db if item.id != item_id]
    return {"message": "Item deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

