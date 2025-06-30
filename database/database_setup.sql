-- Local Database Setup Script
-- Run this in SQL Server Management Studio or your preferred SQL client

-- Create database
CREATE DATABASE pathfinder_local
GO

USE pathfinder_local
GO

-- Create users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('sales_rep', 'surgeon', 'admin')),
    saml_id NVARCHAR(255) NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
)
GO

-- Create hospitals table
CREATE TABLE hospitals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    city NVARCHAR(100) NULL,
    state NVARCHAR(50) NULL,
    country NVARCHAR(100) DEFAULT 'USA',
    size_category NVARCHAR(20) CHECK (size_category IN ('small', 'medium', 'large')),
    bed_count INT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
)
GO

-- Create conversations table
CREATE TABLE conversations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sales_rep_id INT NOT NULL,
    surgeon_name NVARCHAR(255) NOT NULL,
    hospital_id INT NOT NULL,
    hospital_name NVARCHAR(255) NOT NULL,
    conversation_date DATE NOT NULL,
    status NVARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    alignment_score_mechanical INT DEFAULT 0,
    alignment_score_adjusted INT DEFAULT 0,
    alignment_score_restrictive INT DEFAULT 0,
    alignment_score_kinematic INT DEFAULT 0,
    recommended_approach NVARCHAR(100) NULL,
    completed_at DATETIME2 NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (sales_rep_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
)
GO

-- Create conversation_responses table
CREATE TABLE conversation_responses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id INT NOT NULL,
    question_id NVARCHAR(50) NOT NULL,
    response_value NVARCHAR(MAX) NOT NULL,
    score_mechanical INT DEFAULT 0,
    score_adjusted INT DEFAULT 0,
    score_restrictive INT DEFAULT 0,
    score_kinematic INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, question_id)
)
GO

-- Create conversation_notes table
CREATE TABLE conversation_notes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id INT NOT NULL,
    sales_rep_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sales_rep_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, sales_rep_id)
)
GO

-- Create glossary table
CREATE TABLE glossary (
    id INT IDENTITY(1,1) PRIMARY KEY,
    term NVARCHAR(255) NOT NULL UNIQUE,
    definition NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(100) NULL,
    synonyms NVARCHAR(500) NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
)
GO

-- Insert sample data for development

-- Sample user (sales rep)
INSERT INTO users (email, name, role) VALUES
('test@jj.com', 'Test Sales Rep', 'sales_rep'),
('surgeon@hospital.com', 'Dr. Test Surgeon', 'surgeon')
GO

-- Sample hospitals
INSERT INTO hospitals (name, city, state, size_category, bed_count) VALUES
('General Hospital', 'New York', 'NY', 'large', 500),
('Community Medical Center', 'Chicago', 'IL', 'medium', 200),
('Regional Health System', 'Houston', 'TX', 'large', 750),
('City Memorial Hospital', 'Phoenix', 'AZ', 'medium', 150),
('Rural Care Hospital', 'Small Town', 'OH', 'small', 75)
GO

-- Sample glossary terms
INSERT INTO glossary (term, definition, category) VALUES
('HKA', 'Hip-Knee-Ankle angle - the mechanical axis angle measured from hip center to ankle center through the knee', 'Alignment'),
('TKA', 'Total Knee Arthroplasty - surgical procedure to replace the knee joint', 'Surgery'),
('Mechanical Alignment', 'Surgical technique that aims for neutral mechanical axis (0° HKA)', 'Alignment Philosophy'),
('Kinematic Alignment', 'Surgical technique that restores the pre-arthritic joint line and limb alignment', 'Alignment Philosophy'),
('Flexion Gap', 'The space between the femur and tibia when the knee is flexed to 90 degrees', 'Surgical Technique'),
('Extension Gap', 'The space between the femur and tibia when the knee is in full extension', 'Surgical Technique')
GO

-- Create indexes for better performance
CREATE INDEX IX_conversations_sales_rep_date ON conversations (sales_rep_id, conversation_date DESC)
GO

CREATE INDEX IX_conversation_responses_conversation ON conversation_responses (conversation_id)
GO

CREATE INDEX IX_hospitals_name ON hospitals (name)
GO

CREATE INDEX IX_glossary_term ON glossary (term)
GO

-- Sample conversation for testing
DECLARE @salesRepId INT = (SELECT id FROM users WHERE email = 'test@jj.com')
DECLARE @hospitalId INT = (SELECT id FROM hospitals WHERE name = 'General Hospital')

INSERT INTO conversations (sales_rep_id, surgeon_name, hospital_id, hospital_name, conversation_date, status)
VALUES (@salesRepId, 'Dr. John Smith', @hospitalId, 'General Hospital', '2025-06-10', 'completed')
GO

PRINT 'Database setup complete!'
PRINT 'Sample data inserted:'
PRINT '- Test sales rep: test@jj.com'
PRINT '- Sample hospitals and glossary terms'
PRINT '- One sample conversation'