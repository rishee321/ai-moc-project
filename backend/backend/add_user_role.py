import sqlite3


DATABASE = "ai_mock_interview.db"


connection = sqlite3.connect(DATABASE)

cursor = connection.cursor()


cursor.execute("PRAGMA table_info(users)")

columns = [
    column[1]
    for column in cursor.fetchall()
]


if "role" not in columns:

    cursor.execute("""
        ALTER TABLE users
        ADD COLUMN role VARCHAR(20) DEFAULT 'user'
    """)

    print("Role column added successfully!")

else:

    print("Role column already exists.")


connection.commit()
connection.close()


print("User role migration completed!")