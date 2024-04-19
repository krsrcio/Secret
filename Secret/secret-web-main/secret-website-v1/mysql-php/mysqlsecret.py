import mysql.connector
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    user_data = get_user_data()  
    return render_template('index.html', user_data=user_data)

def get_user_data():
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': 'secret13',  
        'database': 'SecretSQL',
    }

    try:
        connection = mysql.connector.connect(**db_config)

        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)

            select_query = "SELECT * FROM users"
            cursor.execute(select_query)

            user_data = cursor.fetchall()

            return user_data

    except mysql.connector.Error as err:
        print(f"Error: {err}")

    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed")

if __name__ == '__main__':
    app.run(debug=True)
