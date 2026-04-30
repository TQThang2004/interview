import asyncio
import asyncpg
import os
from dotenv import load_dotenv

_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

async def set_admin():
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "123")
    db_name = os.getenv("DB_NAME", "ai_mock_interview_db")

    dsn = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
    
    try:
        conn = await asyncpg.connect(dsn)
        await conn.execute("UPDATE users SET role = 'admin'")
        print("Updated all users to admin role successfully.")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(set_admin())
