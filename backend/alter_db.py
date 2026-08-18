import os
import sys
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from app.db.session import engine

def alter_table():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"))
        conn.commit()
    print("Table altered successfully.")

if __name__ == "__main__":
    alter_table()
