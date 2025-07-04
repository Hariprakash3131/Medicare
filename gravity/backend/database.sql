-- Create the database
CREATE DATABASE IF NOT EXISTS gravity_db;

-- Use the database
USE gravity_db;

-- Table: users
-- Stores login credentials and role for all users.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'caretaker') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: patients
-- Stores patient-specific information.
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: caretakers
-- Stores caretaker-specific information.
CREATE TABLE IF NOT EXISTS caretakers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: caretaker_patient_assignments
-- Maps caretakers to patients (many-to-many relationship).
CREATE TABLE IF NOT EXISTS caretaker_patient_assignments (
    caretaker_id INT NOT NULL,
    patient_id INT NOT NULL,
    PRIMARY KEY (caretaker_id, patient_id),
    FOREIGN KEY (caretaker_id) REFERENCES caretakers(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Table: activities
-- Stores recent activity information for user feeds.
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: calendar_events
-- Stores events for the calendar feature.
CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: notifications
-- Stores notifications for users.
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 

show tables;

select * from users;

CREATE TABLE IF NOT EXISTS medication_taken (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    taken_date DATE NOT NULL,
    photo_url VARCHAR(255), -- Optional: if you want to store the uploaded photo's path
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, taken_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

select * from medication_taken;
delete from medication_taken where id = 3;

CREATE TABLE IF NOT EXISTS medication_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    medication_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    time_of_day VARCHAR(100),
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
