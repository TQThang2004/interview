"""
Database Init – Script khởi tạo / seed database ban đầu.

Chạy một lần để tạo schema và dữ liệu mẫu ban đầu.
Sử dụng: python -m app.database.init_db
"""
import asyncio
import os
from dotenv import load_dotenv

_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

# Path đến file schema SQL
_SCHEMA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../database/schema.sql")
)


async def init_database() -> None:
    """Đọc và chạy schema.sql để khởi tạo database."""
    import asyncpg

    conn = await asyncpg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "ai_mock_interview_db"),
    )

    try:
        with open(_SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema_sql = f.read()

        await conn.execute(schema_sql)
        print("[InitDB] Database schema đã được khởi tạo thành công.")
    except FileNotFoundError:
        print(f"[InitDB] Không tìm thấy file schema: {_SCHEMA_PATH}")
    except Exception as e:
        print(f"[InitDB] Lỗi khi khởi tạo database: {e}")
        raise
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(init_database())
