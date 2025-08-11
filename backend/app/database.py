import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.host = os.getenv('MYSQL_HOST')
        self.user = os.getenv('MYSQL_USER')
        self.password = os.getenv('MYSQL_PASSWORD')
        self.database = os.getenv('MYSQL_DATABASE')
        self.connection = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            if self.connection.is_connected():
                print("Successfully connected to MySQL database")
        except Error as e:
            print(f"Error while connecting to MySQL: {e}")

    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection is closed")

    def execute_query(self, query, params=None):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(query, params)
            if query.strip().upper().startswith('SELECT'):
                return cursor.fetchall()
            else:
                self.connection.commit()
                return cursor.rowcount
        except Error as e:
            print(f"Error executing query: {e}")
            return None
        finally:
            cursor.close()

    def execute_one(self, query, params=None):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(query, params)
            return cursor.fetchone()
        except Error as e:
            print(f"Error executing query: {e}")
            return None
        finally:
            cursor.close()

# Database instance
db = Database()