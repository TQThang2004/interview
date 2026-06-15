import asyncio
import os
from pathlib import Path

import asyncpg
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
DB_DIR = Path(__file__).resolve().parent
load_dotenv(ROOT_DIR / ".env", override=True)

MIGRATIONS = [
    "migrate_add_google_auth.sql",
    "migrate_community_moderation.sql",
]


def _dsn() -> str:
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME", "ai_mock_interview_db")
    return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"


async def run_migration() -> None:
    conn = await asyncpg.connect(_dsn())
    try:
        schema_path = DB_DIR / "schema.sql"
        await conn.execute(schema_path.read_text(encoding="utf-8"))
        print("[Migration] Applied source schema.sql")

        for filename in MIGRATIONS:
            path = DB_DIR / filename
            if not path.exists():
                print(f"[Migration] Skip missing file: {filename}")
                continue
            sql = path.read_text(encoding="utf-8")
            await conn.execute(sql)
            print(f"[Migration] Applied: {filename}")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_migration())
