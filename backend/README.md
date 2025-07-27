# Coaching Backend API

A Go-based REST API for the coaching application built with Gin Gonic and MySQL.

## Features

- **Team Members**: CRUD operations for team members with name, email, and picture
- **Teams**: CRUD operations for teams with name and logo
- **Assignments**: Assign team members to teams
- **Feedback**: Give feedback to teams or individual members
- **MySQL Database**: Persistent data storage with GORM
- **CORS Support**: Cross-origin requests enabled

## Technology Stack

- **Go**: Latest version
- **Gin Gonic**: HTTP web framework
- **GORM**: ORM for database operations
- **MySQL**: Database
- **Docker**: For MySQL container

## Getting Started

### Prerequisites

- Go installed
- Docker installed (for MySQL)

### Quick Start

```bash
# Build the application
./build.sh

# Run the application (includes MySQL setup)
./run.sh
```

### Manual Setup

1. **Start MySQL:**
```bash
docker run --name coaching-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=coaching_db -p 3306:3306 -d mysql:8.0
```

2. **Build and run:**
```bash
./build.sh
export DATABASE_URL="root:password@tcp(localhost:3306)/coaching_db?charset=utf8mb4&parseTime=True&loc=Local"
./coaching-backend
```

## API Endpoints

### Team Members
- `POST /api/members` - Create team member
- `GET /api/members` - Get all team members
- `GET /api/members/:id` - Get team member by ID
- `PUT /api/members/:id` - Update team member
- `DELETE /api/members/:id` - Delete team member

### Teams
- `POST /api/teams` - Create team
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Assignments
- `POST /api/assignments` - Assign member to team
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/unassigned` - Get unassigned members
- `DELETE /api/assignments/member/:id` - Remove member from team

### Feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback` - Get all feedback (supports target_type and target_id query params)
- `GET /api/feedback/:id` - Get feedback by ID
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Health Check
- `GET /health` - API health status

## Example Requests

### Create Team Member
```json
POST /api/members
{
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://example.com/photo.jpg"
}
```

### Create Team
```json
POST /api/teams
{
  "name": "Development Team",
  "logo": "https://example.com/logo.png"
}
```

### Assign Member to Team
```json
POST /api/assignments
{
  "member_id": 1,
  "team_id": 1
}
```

### Create Feedback
```json
POST /api/feedback
{
  "content": "Great work on the project!",
  "target_type": "member",
  "target_id": 1
}
```

## Environment Variables

- `DATABASE_URL`: MySQL connection string (default: local MySQL)
- `PORT`: Server port (default: 8080)

## Database Schema

The application automatically creates these tables:
- `team_members`: Store team member information
- `teams`: Store team information
- `feedback`: Store feedback entries
