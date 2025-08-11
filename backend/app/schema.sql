
CREATE DATABASE IF NOT EXISTS exam_db;
USE exam_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Unique user ID
    username VARCHAR(50) UNIQUE NOT NULL,     -- Username (must be unique)
    email VARCHAR(100) UNIQUE NOT NULL,       -- Email (must be unique)
    password_hash VARCHAR(255) NOT NULL,      -- Hashed password (never store plain text!)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- When user registered
);

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Unique question ID
    question_text TEXT NOT NULL,              -- The actual question
    option_a VARCHAR(255) NOT NULL,           -- Option A
    option_b VARCHAR(255) NOT NULL,           -- Option B
    option_c VARCHAR(255) NOT NULL,           -- Option C
    option_d VARCHAR(255) NOT NULL,           -- Option D
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,  -- Correct answer (A, B, C, or D)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP     -- When question was added
);

CREATE TABLE exam_results (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Unique result ID
    user_id INT NOT NULL,                     -- Which user took the exam
    score INT NOT NULL,                       -- Number of correct answers
    total_questions INT NOT NULL,             -- Total questions in the exam
    answers TEXT,                             -- Detailed answers (stores as JSON string)
    started_at TIMESTAMP NOT NULL,            -- When exam was started
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When exam was submitted
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Links to users table
);

INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
('What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C'),
('Which programming language is known as the "language of the web"?', 'Python', 'JavaScript', 'Java', 'C++', 'B'),
('What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language', 'A'),
('Which of the following is a JavaScript framework?', 'Django', 'Flask', 'React', 'Laravel', 'C'),
('What is the result of 2 + 2 * 3?', '12', '8', '10', '6', 'B'),
('Which HTTP status code indicates "Not Found"?', '200', '301', '404', '500', 'C'),
('What does CSS stand for?', 'Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets', 'C'),
('Which of the following is a NoSQL database?', 'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'C'),
('What is the purpose of the "git" command?', 'Text editing', 'Version control', 'File compression', 'Network monitoring', 'B'),
('Which of the following is a Python web framework?', 'React', 'Angular', 'Django', 'Vue.js', 'C');
