import asyncio
from app.db.session import engine
from sqlalchemy import text

async def make_admin():
    async with engine.begin() as conn:
        await conn.execute(text(
            "UPDATE users SET is_admin = TRUE WHERE email = 'ayaulymamirzhanova@gmail.com'"
        ))
        print('Админ болдыңыз!')

asyncio.run(make_admin())