import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load env variables
_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

async def run_migration():
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "123")
    db_name = os.getenv("DB_NAME", "ai_mock_interview_db")

    dsn = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
    
    with open("c:/DOAN/Data/backend/database/migrate_community.sql", "r", encoding="utf-8") as f:
        sql = f.read()
    
    try:
        conn = await asyncpg.connect(dsn)
        await conn.execute(sql)
        print("Migration executed successfully.")
        await conn.close()
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(run_migration())
