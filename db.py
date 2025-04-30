import sqlite3

def get_connection():
    return sqlite3.connect("school.db")

def initialize_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            class TEXT NOT NULL,
            section TEXT NOT NULL,
            monthly_fee INTEGER NOT NULL,
            status TEXT DEFAULT 'Active'
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            month TEXT,
            amount_paid INTEGER,
            payment_date TEXT,
            FOREIGN KEY(student_id) REFERENCES students(id)
        )
    ''')
    conn.commit()
    conn.close()
