import os
from flask import Flask, request, jsonify, send_from_directory
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import secrets

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes, allowing your React frontend to communicate with this backend
CORS(app)

# --- Database Connection Configuration ---
# Load configuration from environment variables
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER') # Replace with your MySQL username
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD') # Replace with your MySQL password
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'gravity_db')
# app.config['MYSQL_HOST'] = 'localhost'
# app.config['MYSQL_USER'] = 'root'  # <-- EDIT THIS
# app.config['MYSQL_PASSWORD'] = 'harip3131@' # <-- AND THIS
# app.config['MYSQL_DB'] = 'gravity_db'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor' # Returns results as dictionaries

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Initialize MySQL
mysql = MySQL(app)

# --- Routes ---
@app.route('/')
def index():
    return "Welcome to the Gravity Backend!"

@app.route('/signup', methods=['POST'])
def signup():
    # Get data from the incoming request's JSON payload
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # 'patient' or 'caretaker'
    first_name = data.get('firstName')
    last_name = data.get('lastName')

    # Basic validation
    if not all([email, password, role, first_name, last_name]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if role not in ['patient', 'caretaker']:
        return jsonify({"error": "Invalid role specified"}), 400

    # Hash the password for secure storage
    hashed_password = generate_password_hash(password)

    try:
        cur = mysql.connection.cursor()

        # Check if user already exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "User with this email already exists"}), 409

        # Insert into users table
        cur.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s)",
            (email, hashed_password, role)
        )
        # Get the ID of the new user
        user_id = cur.lastrowid

        # Insert into the role-specific table
        if role == 'patient':
            cur.execute(
                "INSERT INTO patients (user_id, first_name, last_name) VALUES (%s, %s, %s)",
                (user_id, first_name, last_name)
            )
        elif role == 'caretaker':
            cur.execute(
                "INSERT INTO caretakers (user_id, first_name, last_name) VALUES (%s, %s, %s)",
                (user_id, first_name, last_name)
            )

        # Commit all changes to the database
        mysql.connection.commit()
        cur.close()

        return jsonify({"message": f"User '{email}' created successfully as a {role}."}), 201

    except Exception as e:
        # If any error occurs, return a generic server error
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT id, email, password_hash, role FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()

        if user and check_password_hash(user['password_hash'], password):
            # Passwords match, user is authenticated
            return jsonify({
                "message": "Login successful!",
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "role": user['role']
                }
            }), 200
        else:
            # Invalid credentials
            return jsonify({"error": "Invalid email or password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT id, email, role FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        cur.close()
        if user:
            return jsonify(user), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/medication-taken', methods=['POST'])
def mark_medication_taken():
    user_id = request.form.get('user_id')
    taken_date = request.form.get('taken_date')  # format: 'YYYY-MM-DD'
    photo_url = None

    # Handle file upload if present
    if 'photo' in request.files:
        file = request.files['photo']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            photo_url = f'/uploads/{filename}'

    if not user_id or not taken_date:
        return jsonify({'error': 'Missing user_id or taken_date'}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute(
            "INSERT IGNORE INTO medication_taken (user_id, taken_date, photo_url) VALUES (%s, %s, %s)",
            (user_id, taken_date, photo_url)
        )
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Medication marked as taken!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/medication-taken/<int:user_id>', methods=['GET'])
def get_taken_dates(user_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute(
            "SELECT taken_date, photo_url FROM medication_taken WHERE user_id = %s",
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close()
        # Return both dates and photo URLs if you want to show previews
        return jsonify({'taken_dates': [row['taken_date'].strftime('%Y-%m-%d') for row in rows],
                        'photos': {row['taken_date'].strftime('%Y-%m-%d'): row['photo_url'] for row in rows if row['photo_url']}}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/all-patient-stats', methods=['GET'])
def all_patient_stats():
    try:
        cur = mysql.connection.cursor()
        # Get all patients and their user info
        cur.execute("""
            SELECT p.id as patient_id, u.id as user_id, u.email, p.first_name, p.last_name
            FROM patients p
            JOIN users u ON p.user_id = u.id
        """)
        patients = cur.fetchall()
        result = []
        today = None
        from datetime import datetime, timedelta, date
        today = date.today()
        start_of_month = today.replace(day=1)
        start_of_week = today - timedelta(days=today.weekday())  # Monday as start
        days_in_month = (today.replace(month=today.month % 12 + 1, day=1) - timedelta(days=1)).day
        for patient in patients:
            user_id = patient['user_id']
            # Get all taken dates for this patient
            cur.execute("SELECT taken_date FROM medication_taken WHERE user_id = %s ORDER BY taken_date", (user_id,))
            taken_rows = cur.fetchall()
            taken_dates = [row['taken_date'] for row in taken_rows]
            taken_dates_str = [d.strftime('%Y-%m-%d') for d in taken_dates]
            # Current streak
            streak = 0
            current = today
            taken_set = set(taken_dates_str)
            while current.strftime('%Y-%m-%d') in taken_set:
                streak += 1
                current -= timedelta(days=1)
            # Taken this week
            taken_this_week = sum(1 for d in taken_dates if d >= start_of_week)
            # Taken this month
            taken_this_month = sum(1 for d in taken_dates if d >= start_of_month)
            # Missed this month
            missed_this_month = (today.day if today.month == start_of_month.month else days_in_month) - taken_this_month
            # Remaining this month
            remaining = days_in_month - today.day
            # Percent adherence
            percent = round((taken_this_month / today.day) * 100, 2) if today.day > 0 else 0
            result.append({
                'id': patient['patient_id'],
                'user_id': user_id,
                'email': patient['email'],
                'first_name': patient['first_name'],
                'last_name': patient['last_name'],
                'streak': streak,
                'taken_this_week': taken_this_week,
                'taken': taken_this_month,
                'missed': missed_this_month,
                'remaining': remaining,
                'percent': percent,
                'missed_this_month': missed_this_month
            })
        cur.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/medication-schedule', methods=['POST'])
def add_medication_schedule():
    data = request.get_json()
    patient_id = data.get('patient_id')
    medication_name = data.get('medication_name')
    dosage = data.get('dosage')
    frequency = data.get('frequency')
    time_of_day = data.get('time_of_day')
    notes = data.get('notes')
    if not all([patient_id, medication_name, dosage, frequency]):
        return jsonify({'error': 'Missing required fields'}), 400
    try:
        cur = mysql.connection.cursor()
        cur.execute(
            "INSERT INTO medication_schedule (patient_id, medication_name, dosage, frequency, time_of_day, notes) VALUES (%s, %s, %s, %s, %s, %s)",
            (patient_id, medication_name, dosage, frequency, time_of_day, notes)
        )
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Medication schedule added!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/medication-schedule/<int:user_id>', methods=['GET'])
def get_medication_schedule(user_id):
    try:
        cur = mysql.connection.cursor()
        # Get patient id from user id
        cur.execute("SELECT id FROM patients WHERE user_id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'Patient not found'}), 404
        patient_id = row['id']
        cur.execute("SELECT medication_name, dosage, frequency, time_of_day, notes FROM medication_schedule WHERE patient_id = %s", (patient_id,))
        schedules = cur.fetchall()
        cur.close()
        return jsonify({'schedules': schedules}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# (You can add the GET endpoint for fetching taken dates here too)

# --- Main Execution ---
if __name__ == '__main__':
    # The host '0.0.0.0' makes the server publicly available
    app.run(host='0.0.0.0', port=5001, debug=True)

app.secret_key = os.getenv('SECRET_KEY', 'k2J8n3lK9pQ1rS4vT7uW0xZ6mY3cA5eH2fG8dJ0kL1oP4qS7t')
