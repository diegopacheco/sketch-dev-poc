-- Coaching Application Database Schema
-- MySQL 9.0 Compatible
-- This script creates the database and all required tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS coaching_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coaching_db;

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    logo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_teams_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    picture TEXT,
    team_id INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY idx_team_members_email (email),
    INDEX idx_team_members_team_id (team_id),
    INDEX idx_team_members_name (name),
    CONSTRAINT fk_team_members_team_id 
        FOREIGN KEY (team_id) REFERENCES teams(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    content TEXT NOT NULL,
    target_type ENUM('team', 'member') NOT NULL,
    target_id INT UNSIGNED NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_feedback_target (target_type, target_id),
    INDEX idx_feedback_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for development
INSERT IGNORE INTO teams (name, logo) VALUES 
    ('Development Team', 'https://example.com/dev-logo.png'),
    ('Design Team', 'https://example.com/design-logo.png'),
    ('Marketing Team', 'https://example.com/marketing-logo.png');

INSERT IGNORE INTO team_members (name, email, picture, team_id) VALUES 
    ('John Doe', 'john@example.com', 'https://example.com/john.jpg', 1),
    ('Jane Smith', 'jane@example.com', 'https://example.com/jane.jpg', 1),
    ('Bob Wilson', 'bob@example.com', 'https://example.com/bob.jpg', 2),
    ('Alice Brown', 'alice@example.com', 'https://example.com/alice.jpg', NULL);

INSERT IGNORE INTO feedback (content, target_type, target_id, target_name) VALUES 
    ('Excellent work on the new feature implementation!', 'member', 1, 'John Doe'),
    ('Great collaboration and communication skills.', 'member', 2, 'Jane Smith'),
    ('Outstanding team performance this quarter.', 'team', 1, 'Development Team'),
    ('Creative and innovative design solutions.', 'team', 2, 'Design Team');

-- Create indexes for performance
CREATE INDEX idx_team_members_created_at ON team_members(created_at);
CREATE INDEX idx_teams_created_at ON teams(created_at);

-- Show table information
SHOW TABLES;

-- Display table structures
DESC teams;
DESC team_members;
DESC feedback;

-- Display sample data counts
SELECT 'Teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Team Members', COUNT(*) FROM team_members
UNION ALL
SELECT 'Feedback', COUNT(*) FROM feedback;
