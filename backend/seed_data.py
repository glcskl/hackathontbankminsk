"""
Скрипт для заполнения базы данных тестовыми данными
"""
from database import SessionLocal, init_db
from models import Recipe, Ingredient, Step, Review
import sys


def seed_database():
    """Заполняет базу данных тестовыми рецептами"""
    # Инициализируем БД
    init_db()
    
    db = SessionLocal()
    
    try:
        # Проверяем, есть ли уже данные
        existing_recipes = db.query(Recipe).count()
        if existing_recipes > 0:
            print(f"В базе данных уже есть {existing_recipes} рецептов. Пропускаем заполнение.")
            return
        
        # Рецепт 1: Американские панкейки
        recipe1 = Recipe(
            title="Американские панкейки",
            category="Завтрак",
            cook_time=20,
            servings=4,
            calories_per_serving=220,
            image="https://images.unsplash.com/photo-1637533114107-1dc725c6e576?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5jYWtlcyUyMGJyZWFrZmFzdHxlbnwxfHx8fDE3NjM3NTU1Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
        )
        db.add(recipe1)
        db.flush()
        
        ingredients1 = [
            Ingredient(recipe_id=recipe1.id, name="Мука", amount="200", unit="г", order=0),
            Ingredient(recipe_id=recipe1.id, name="Молоко", amount="250", unit="мл", order=1),
            Ingredient(recipe_id=recipe1.id, name="Яйца", amount="2", unit="шт", order=2),
            Ingredient(recipe_id=recipe1.id, name="Сахар", amount="2", unit="ст.л.", order=3),
            Ingredient(recipe_id=recipe1.id, name="Разрыхлитель", amount="1", unit="ч.л.", order=4),
            Ingredient(recipe_id=recipe1.id, name="Соль", amount="0.5", unit="ч.л.", order=5),
            Ingredient(recipe_id=recipe1.id, name="Сливочное масло", amount="30", unit="г", order=6),
        ]
        db.add_all(ingredients1)
        
        steps1 = [
            Step(recipe_id=recipe1.id, number=1, instruction="В большой миске смешайте муку, сахар, разрыхлитель и соль.", image="https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhpbmclMjBmbG91ciUyMGluZ3JlZGllbnRzfGVufDF8fHx8MTc2MzgwNzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", order=0),
            Step(recipe_id=recipe1.id, number=2, instruction="В отдельной миске взбейте яйца с молоком.", image="https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=1),
            Step(recipe_id=recipe1.id, number=3, instruction="Растопите сливочное масло и дайте ему немного остыть.", image="https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=2),
            Step(recipe_id=recipe1.id, number=4, instruction="Смешайте жидкие ингредиенты с сухими, добавьте растопленное масло. Не перемешивайте слишком долго - небольшие комочки допустимы.", image="https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=3),
            Step(recipe_id=recipe1.id, number=5, instruction="Разогрейте сковороду на среднем огне, слегка смажьте маслом.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=4),
            Step(recipe_id=recipe1.id, number=6, instruction="Выливайте тесто порциями и жарьте до появления пузырьков на поверхности, затем переверните и жарьте еще 1-2 минуты.", image="https://images.unsplash.com/photo-1740836257337-0d4fd26db36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5jYWtlcyUyMGNvb2tpbmclMjBwcm9jZXNzfGVufDF8fHx8MTc2MzgwNzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", order=5),
        ]
        db.add_all(steps1)
        
        reviews1 = [
            Review(recipe_id=recipe1.id, author="Анна", rating=5, comment="Отличный рецепт! Панкейки получились очень пышными и вкусными. Вся семья в восторге!", date="15 ноя 2024"),
            Review(recipe_id=recipe1.id, author="Михаил", rating=4, comment="Хороший рецепт, но я добавил немного ванили для аромата. Рекомендую!", date="10 ноя 2024"),
        ]
        db.add_all(reviews1)
        
        # Рецепт 2: Паста Болоньезе
        recipe2 = Recipe(
            title="Паста Болоньезе",
            category="Обед",
            cook_time=45,
            servings=4,
            calories_per_serving=520,
            image="https://images.unsplash.com/photo-1622973536968-3ead9e780960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGJvbG9nbmVzZXxlbnwxfHx8fDE3NjM3NzI0MDl8MA&ixlib=rb-4.1.0&q=80&w=1080"
        )
        db.add(recipe2)
        db.flush()
        
        ingredients2 = [
            Ingredient(recipe_id=recipe2.id, name="Спагетти", amount="400", unit="г", order=0),
            Ingredient(recipe_id=recipe2.id, name="Говяжий фарш", amount="500", unit="г", order=1),
            Ingredient(recipe_id=recipe2.id, name="Лук репчатый", amount="1", unit="шт", order=2),
            Ingredient(recipe_id=recipe2.id, name="Морковь", amount="1", unit="шт", order=3),
            Ingredient(recipe_id=recipe2.id, name="Томаты в собственном соку", amount="400", unit="г", order=4),
            Ingredient(recipe_id=recipe2.id, name="Томатная паста", amount="2", unit="ст.л.", order=5),
            Ingredient(recipe_id=recipe2.id, name="Чеснок", amount="3", unit="зубчика", order=6),
            Ingredient(recipe_id=recipe2.id, name="Оливковое масло", amount="3", unit="ст.л.", order=7),
            Ingredient(recipe_id=recipe2.id, name="Базилик сушеный", amount="1", unit="ч.л.", order=8),
            Ingredient(recipe_id=recipe2.id, name="Соль и перец", amount="по", unit="вкусу", order=9),
        ]
        db.add_all(ingredients2)
        
        steps2 = [
            Step(recipe_id=recipe2.id, number=1, instruction="Мелко нарежьте лук, морковь и чеснок.", image="https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=0),
            Step(recipe_id=recipe2.id, number=2, instruction="Разогрейте оливковое масло в большой сковороде, обжарьте лук до прозрачности.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=1),
            Step(recipe_id=recipe2.id, number=3, instruction="Добавьте морковь и чеснок, жарьте еще 3 минуты.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=2),
            Step(recipe_id=recipe2.id, number=4, instruction="Добавьте фарш, разбивая комочки. Жарьте до румяности около 10 минут.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=3),
            Step(recipe_id=recipe2.id, number=5, instruction="Добавьте томаты, томатную пасту, базилик, соль и перец. Тушите на медленном огне 20-25 минут.", image="https://images.unsplash.com/photo-1612078960243-177e68303e7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwcGFzdElMjBzYXVjZXxlbnwxfHx8fDE3NjM4MDc2ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", order=4),
            Step(recipe_id=recipe2.id, number=6, instruction="Отварите спагетти согласно инструкции на упаковке. Смешайте с соусом и подавайте.", image="https://images.unsplash.com/photo-1622973536968-3ead9e780960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=5),
        ]
        db.add_all(steps2)
        
        # Рецепт 3: Омлет с овощами
        recipe3 = Recipe(
            title="Омлет с овощами",
            category="Завтрак",
            cook_time=15,
            servings=2,
            calories_per_serving=180,
            image="https://images.unsplash.com/photo-1668283653825-37b80f055b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbWVsZXR0ZSUyMGVnZ3N8ZW58MXx8fHwxNjM4MDM4NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
        )
        db.add(recipe3)
        db.flush()
        
        ingredients3 = [
            Ingredient(recipe_id=recipe3.id, name="Яйца", amount="4", unit="шт", order=0),
            Ingredient(recipe_id=recipe3.id, name="Молоко", amount="50", unit="мл", order=1),
            Ingredient(recipe_id=recipe3.id, name="Болгарский перец", amount="1", unit="шт", order=2),
            Ingredient(recipe_id=recipe3.id, name="Помидор", amount="1", unit="шт", order=3),
            Ingredient(recipe_id=recipe3.id, name="Зеленый лук", amount="2", unit="стебля", order=4),
            Ingredient(recipe_id=recipe3.id, name="Сливочное масло", amount="20", unit="г", order=5),
            Ingredient(recipe_id=recipe3.id, name="Соль и перец", amount="по", unit="вкусу", order=6),
        ]
        db.add_all(ingredients3)
        
        steps3 = [
            Step(recipe_id=recipe3.id, number=1, instruction="Нарежьте перец и помидор кубиками, зеленый лук мелко нашинкуйте.", image="https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=0),
            Step(recipe_id=recipe3.id, number=2, instruction="Взбейте яйца с молоком, солью и перцем до однородности.", image="https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=1),
            Step(recipe_id=recipe3.id, number=3, instruction="Растопите масло на сковороде, обжарьте перец 2-3 минуты.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=2),
            Step(recipe_id=recipe3.id, number=4, instruction="Добавьте помидор, жарьте еще 1 минуту.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=3),
            Step(recipe_id=recipe3.id, number=5, instruction="Залейте овощи яичной смесью, посыпьте зеленым луком.", image="https://images.unsplash.com/photo-1668283653825-37b80f055b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=4),
            Step(recipe_id=recipe3.id, number=6, instruction="Готовьте на среднем огне под крышкой 5-7 минут до готовности.", image="https://images.unsplash.com/photo-1668283653825-37b80f055b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=5),
        ]
        db.add_all(steps3)
        
        # Рецепт 4: Лосось на гриле
        recipe4 = Recipe(
            title="Лосось на гриле",
            category="Ужин",
            cook_time=25,
            servings=2,
            calories_per_serving=350,
            image="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2FsbW9ufGVufDF8fHx8MTc2MzcwMzYyOXww&ixlib=rb-4.1.0&q=80&w=1080"
        )
        db.add(recipe4)
        db.flush()
        
        ingredients4 = [
            Ingredient(recipe_id=recipe4.id, name="Филе лосося", amount="400", unit="г", order=0),
            Ingredient(recipe_id=recipe4.id, name="Лимон", amount="1", unit="шт", order=1),
            Ingredient(recipe_id=recipe4.id, name="Оливковое масло", amount="2", unit="ст.л.", order=2),
            Ingredient(recipe_id=recipe4.id, name="Чеснок", amount="2", unit="зубчика", order=3),
            Ingredient(recipe_id=recipe4.id, name="Свежий укроп", amount="3", unit="веточки", order=4),
            Ingredient(recipe_id=recipe4.id, name="Соль и перец", amount="по", unit="вкусу", order=5),
        ]
        db.add_all(ingredients4)
        
        steps4 = [
            Step(recipe_id=recipe4.id, number=1, instruction="Смешайте оливковое масло, сок половины лимона, измельченный чеснок, соль и перец.", image="https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=0),
            Step(recipe_id=recipe4.id, number=2, instruction="Замаринуйте филе лосося в этой смеси на 15 минут.", image="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=1),
            Step(recipe_id=recipe4.id, number=3, instruction="Разогрейте гриль или сковороду-гриль на среднем огне.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=2),
            Step(recipe_id=recipe4.id, number=4, instruction="Выложите лосось кожей вниз и жарьте 4-5 минут.", image="https://images.unsplash.com/photo-1589236103748-2077d3435dbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2FsbW9uJTIwY29va2luZ3xlbnwxfHx8fDE3NjM4MDc2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", order=3),
            Step(recipe_id=recipe4.id, number=5, instruction="Переверните и жарьте еще 3-4 минуты до готовности.", image="https://images.unsplash.com/photo-1589236103748-2077d3435dbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=4),
            Step(recipe_id=recipe4.id, number=6, instruction="Подавайте с дольками лимона и свежим укропом.", image="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=5),
        ]
        db.add_all(steps4)
        
        # Рецепт 5: Салат Цезарь
        recipe5 = Recipe(
            title="Салат Цезарь",
            category="Обед",
            cook_time=20,
            servings=2,
            calories_per_serving=380,
            image="https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZHxlbnwxfHx8fDE3NjM3NzMyOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
        )
        db.add(recipe5)
        db.flush()
        
        ingredients5 = [
            Ingredient(recipe_id=recipe5.id, name="Салат Романо", amount="1", unit="кочан", order=0),
            Ingredient(recipe_id=recipe5.id, name="Куриное филе", amount="300", unit="г", order=1),
            Ingredient(recipe_id=recipe5.id, name="Пармезан", amount="50", unit="г", order=2),
            Ingredient(recipe_id=recipe5.id, name="Белый хлеб", amount="3", unit="ломтика", order=3),
            Ingredient(recipe_id=recipe5.id, name="Чеснок", amount="2", unit="зубчика", order=4),
            Ingredient(recipe_id=recipe5.id, name="Майонез", amount="4", unit="ст.л.", order=5),
            Ingredient(recipe_id=recipe5.id, name="Горчица", amount="1", unit="ч.л.", order=6),
            Ingredient(recipe_id=recipe5.id, name="Лимонный сок", amount="1", unit="ст.л.", order=7),
            Ingredient(recipe_id=recipe5.id, name="Оливковое масло", amount="3", unit="ст.л.", order=8),
        ]
        db.add_all(ingredients5)
        
        steps5 = [
            Step(recipe_id=recipe5.id, number=1, instruction="Обжарьте куриное филе до готовности, нарежьте кубиками.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=0),
            Step(recipe_id=recipe5.id, number=2, instruction="Нарежьте хлеб кубиками, смешайте с измельченным чесноком и оливковым маслом.", image="https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=1),
            Step(recipe_id=recipe5.id, number=3, instruction="Обжарьте хлеб до золотистых сухариков.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=2),
            Step(recipe_id=recipe5.id, number=4, instruction="Приготовьте соус: смешайте майонез, горчицу, лимонный сок и измельченный чеснок.", image="https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=3),
            Step(recipe_id=recipe5.id, number=5, instruction="Порвите салат руками, добавьте курицу и сухарики.", image="https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=4),
            Step(recipe_id=recipe5.id, number=6, instruction="Заправьте соусом, посыпьте тертым пармезаном и подавайте.", image="https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=5),
        ]
        db.add_all(steps5)
        
        # Рецепт 6: Шоколадный торт
        recipe6 = Recipe(
            title="Шоколадный торт",
            category="Десерт",
            cook_time=60,
            servings=8,
            calories_per_serving=450,
            image="https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjYWtlfGVufDF8fHx8MTc2MzcxMjQxOXww&ixlib=rb-4.1.0&q=80&w=1080"
        )
        db.add(recipe6)
        db.flush()
        
        ingredients6 = [
            Ingredient(recipe_id=recipe6.id, name="Мука", amount="200", unit="г", order=0),
            Ingredient(recipe_id=recipe6.id, name="Сахар", amount="200", unit="г", order=1),
            Ingredient(recipe_id=recipe6.id, name="Какао-порошок", amount="50", unit="г", order=2),
            Ingredient(recipe_id=recipe6.id, name="Яйца", amount="3", unit="шт", order=3),
            Ingredient(recipe_id=recipe6.id, name="Молоко", amount="120", unit="мл", order=4),
            Ingredient(recipe_id=recipe6.id, name="Растительное масло", amount="80", unit="мл", order=5),
            Ingredient(recipe_id=recipe6.id, name="Разрыхлитель", amount="2", unit="ч.л.", order=6),
            Ingredient(recipe_id=recipe6.id, name="Ванильный экстракт", amount="1", unit="ч.л.", order=7),
            Ingredient(recipe_id=recipe6.id, name="Темный шоколад", amount="200", unit="г", order=8),
            Ingredient(recipe_id=recipe6.id, name="Сливки 33%", amount="200", unit="мл", order=9),
        ]
        db.add_all(ingredients6)
        
        steps6 = [
            Step(recipe_id=recipe6.id, number=1, instruction="Разогрейте духовку до 180°C. Смажьте форму маслом.", image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=0),
            Step(recipe_id=recipe6.id, number=2, instruction="Смешайте муку, какао, разрыхлитель и половину сахара.", image="https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=1),
            Step(recipe_id=recipe6.id, number=3, instruction="Взбейте яйца с оставшимся сахаром до пышности.", image="https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=2),
            Step(recipe_id=recipe6.id, number=4, instruction="Добавьте молоко, масло и ванильный экстракт к яйцам.", image="https://images.unsplash.com/photo-1609501676725-7186f70a7d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=3),
            Step(recipe_id=recipe6.id, number=5, instruction="Соедините жидкие и сухие ингредиенты, перемешайте до однородности.", image="https://images.unsplash.com/photo-1551185618-07fd482ff86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=4),
            Step(recipe_id=recipe6.id, number=6, instruction="Выпекайте 30-35 минут. Для глазури растопите шоколад со сливками, охладите и покройте остывший торт.", image="https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", order=5),
        ]
        db.add_all(steps6)
        
        # Сохраняем все изменения
        db.commit()
        print("База данных успешно заполнена тестовыми данными!")
        print(f"Добавлено рецептов: 6")
        
    except Exception as e:
        db.rollback()
        print(f"Ошибка при заполнении базы данных: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

