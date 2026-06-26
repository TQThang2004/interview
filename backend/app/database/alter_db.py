import asyncio
import os
import asyncpg
from dotenv import load_dotenv

_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=_env_path, override=True)

async def alter_db():
    conn = await asyncpg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "ai_mock_interview_db"),
    )
    try:
        await conn.execute("ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS image_url VARCHAR(1000);")
        print("Successfully added image_url column.")
        
        await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS fullname VARCHAR(255);")
        await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;")
        await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS level VARCHAR(50);")
        await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(50);")
        await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications BOOLEAN DEFAULT TRUE;")
        print("Successfully added user profile columns.")
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(100) NOT NULL,
                entity_id UUID,
                metadata JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);")
        print("Successfully created audit_logs table and indexes.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(alter_db())
