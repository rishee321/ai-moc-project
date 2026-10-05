import sqlite3


DATABASE = "ai_mock_interview.db"


connection = sqlite3.connect(DATABASE)
cursor = connection.cursor()


# Check existing columns
cursor.execute("PRAGMA table_info(interviews)")
columns = [column[1] for column in cursor.fetchall()]


# Add status column
if "status" not in columns:
    cursor.execute("""
        ALTER TABLE interviews
        ADD COLUMN status VARCHAR(30) DEFAULT 'created'
    """)
    print("status column added")


# Add started_at column
if "started_at" not in columns:
    cursor.execute("""
        ALTER TABLE interviews
        ADD COLUMN started_at DATETIME
    """)
    print("started_at column added")


# Add completed_at column
if "completed_at" not in columns:
    cursor.execute("""
        ALTER TABLE interviews
        ADD COLUMN completed_at DATETIME
    """)
    print("completed_at column added")


connection.commit()
connection.close()


print("Interview table migration completed successfully!")