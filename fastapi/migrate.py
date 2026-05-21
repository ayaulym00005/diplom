"""
Дерекқорға жаңа кестелер қосу скрипті
Alembic орнына тікелей іске қосуға болады

Іске қосу:
  python migrate.py
"""
import asyncio
import sys
sys.path.append('.')

async def migrate():
    from app.db.session import engine
    from app.db.base import Base

    # Барлық модельдерді импорттау (кестелер автоматты жасалады)
    from app.models.user import User
    from app.models.analysis import Analysis
    from app.models.lifestyle import Lifestyle
    from app.api.routes.reviews import Review
    from app.api.routes.diary import DiaryEntry

    print("Миграция басталды...")

    async with engine.begin() as conn:
        # Жоқ кестелерді ғана жасайды (бар кестелерді өзгертпейді)
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Миграция аяқталды!")
    print("Жасалған/тексерілген кестелер:")
    print("  - users")
    print("  - analyses")
    print("  - lifestyles")
    print("  - reviews (user_name колонкасымен)")
    print("  - diary_entries")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())