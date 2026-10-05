import sqlite3

DATABASE = "ai_mock_interview.db"

connection = sqlite3.connect(DATABASE)
cursor = connection.cursor()

print("\n--- TABLES ---")

cursor.execute("""
    SELECT name
    FROM sqlite_master
    WHERE type='table'
    ORDER BY name
""")

tables = cursor.fetchall()

for table in tables:
    print(table[0])

print("\n--- USERS ---")

try:
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()

    if users:
        for user in users:
            print(user)
    else:
        print("Users table is EMPTY")

except sqlite3.Error as e:
    print("Users table not found:", e)

connection.close()