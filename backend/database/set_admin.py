import argparse
import asyncio
import os
from pathlib import Path

import asyncpg
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env", override=True)


def _dsn() -> str:
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME", "ai_mock_interview_db")
    return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"


async def set_admin(email: str) -> bool:
    conn = await asyncpg.connect(_dsn())
    try:
        result = await conn.execute(
            "UPDATE users SET role = 'admin', updated_at = NOW() WHERE email = $1",
            email,
        )
        return result == "UPDATE 1"
    finally:
        await conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Promote one user to admin by email.")
    parser.add_argument("email", help="Email of the user to promote")
    args = parser.parse_args()
    updated = asyncio.run(set_admin(args.email))
    if updated:
        print(f"Promoted {args.email} to admin.")
    else:
        print(f"No user found for email: {args.email}")
