-- Pathfinder Database Schema
-- Run this script to create the required database tables

-- Create database (run this separately if needed)
-- CREATE DATABASE JNJ-PATHFINDER-CONVERSATION;
-- GO
-- USE JNJ-PATHFINDER-CONVERSATION;
-- GO

-- Users table (for sales reps only, surgeons are not tracked)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    role NVARCHAR(50) NOT NULL DEFAULT 'sales_rep',
    department NVARCHAR(100),
    company NVARCHAR(100),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Hospitals table
CREATE TABLE hospitals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    size_category NVARCHAR(50), -- 'small', 'medium', 'large'
    city NVARCHAR(100),
    state NVARCHAR(50),
    country NVARCHAR(100) DEFAULT 'USA',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Conversations table
CREATE TABLE conversations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sales_rep_id INT NOT NULL,
    surgeon_name NVARCHAR(255) NOT NULL,
    hospital_id INT,
    hospital_name NVARCHAR(255), -- Backup if hospital not in hospitals table
    conversation_date DATE NOT NULL,
    status NVARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    alignment_score_mechanical INT DEFAULT 0,
    alignment_score_adjusted INT DEFAULT 0,
    alignment_score_restrictive INT DEFAULT 0,
    alignment_score_kinematic INT DEFAULT 0,
    recommended_approach NVARCHAR(100),
    completed_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (sales_rep_id) REFERENCES users(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Conversation responses table (stores individual question responses)
CREATE TABLE conversation_responses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id INT NOT NULL,
    question_id NVARCHAR(50) NOT NULL, -- Reference to question in JSON
    response_value NVARCHAR(MAX), -- JSON string of the response
    score_mechanical INT DEFAULT 0,
    score_adjusted INT DEFAULT 0,
    score_restrictive INT DEFAULT 0,
    score_kinematic INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Conversation notes table
CREATE TABLE conversation_notes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id INT NOT NULL,
    sales_rep_id INT NOT NULL,
    content NVARCHAR(MAX), -- Rich text content (HTML)
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sales_rep_id) REFERENCES users(id)
);

-- Glossary terms table
CREATE TABLE glossary_terms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    term NVARCHAR(255) NOT NULL UNIQUE,
    definition NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(100),
    synonyms NVARCHAR(500), -- Comma-separated alternative terms
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Session store table (for express-session)
CREATE TABLE sessions (
    sid NVARCHAR(255) NOT NULL PRIMARY KEY,
    session NVARCHAR(MAX) NOT NULL,
    expires DATETIME2,
    
    INDEX IX_sessions_expires (expires)
);

-- Create indexes for better performance
CREATE INDEX IX_conversations_sales_rep_id ON conversations(sales_rep_id);
CREATE INDEX IX_conversations_date ON conversations(conversation_date);
CREATE INDEX IX_conversations_status ON conversations(status);
CREATE INDEX IX_conversation_responses_conversation_id ON conversation_responses(conversation_id);
CREATE INDEX IX_conversation_responses_question_id ON conversation_responses(question_id);
CREATE INDEX IX_conversation_notes_conversation_id ON conversation_notes(conversation_id);
CREATE INDEX IX_glossary_terms_term ON glossary_terms(term);
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_role ON users(role);

GO

-- Insert sample hospitals
INSERT INTO hospitals (name, size_category, city, state) VALUES
('General Hospital', 'large', 'Chicago', 'IL'),
('Community Medical Center', 'medium', 'Springfield', 'IL'),
('Regional Healthcare', 'large', 'Milwaukee', 'WI'),
('St. Mary''s Hospital', 'medium', 'Detroit', 'MI'),
('University Medical Center', 'large', 'Columbus', 'OH'),
('County General', 'small', 'Fort Wayne', 'IN'),
('Metro Health System', 'large', 'Cleveland', 'OH'),
('Sacred Heart Medical', 'medium', 'Grand Rapids', 'MI');

-- Insert sample glossary terms
INSERT INTO glossary_terms (term, definition, category) VALUES
('TKA', 'Total Knee Arthroplasty - A surgical procedure to replace the knee joint with artificial components.', 'Surgery'),
('HKA', 'Hip-Knee-Ankle angle - The mechanical axis angle measured from hip to ankle through the knee.', 'Measurement'),
('Mechanical Alignment', 'A surgical technique that aims to restore the leg to a neutral mechanical axis (0° HKA).', 'Technique'),
('Kinematic Alignment', 'A surgical technique that aims to restore the natural kinematic motion of the knee joint.', 'Technique'),
('Femoral Component', 'The artificial component that replaces the end of the femur (thigh bone) in knee replacement.', 'Implant'),
('Tibial Component', 'The artificial component that replaces the top of the tibia (shin bone) in knee replacement.', 'Implant'),
('Flexion Gap', 'The space between the femur and tibia when the knee is bent (flexed).', 'Measurement'),
('Extension Gap', 'The space between the femur and tibia when the knee is straight (extended).', 'Measurement'),
('Varus', 'An angular deformity where the knee appears to bend inward (knock-kneed).', 'Anatomy'),
('Valgus', 'An angular deformity where the knee appears to bend outward (bow-legged).', 'Anatomy');

GO

-- Create a view for conversation summaries
CREATE VIEW conversation_summary AS
SELECT 
    c.id,
    c.surgeon_name,
    c.hospital_name,
    c.conversation_date,
    c.status,
    c.recommended_approach,
    u.name as sales_rep_name,
    u.email as sales_rep_email,
    c.alignment_score_mechanical,
    c.alignment_score_adjusted,
    c.alignment_score_restrictive,
    c.alignment_score_kinematic,
    c.created_at,
    c.updated_at
FROM conversations c
INNER JOIN users u ON c.sales_rep_id = u.id;

GO