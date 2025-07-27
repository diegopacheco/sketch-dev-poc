# Coaching Application Frontend

A React-based coaching application built with TypeScript, Bun, and React Router.

## Features

- **Add Team Members**: Add team members with name, email, and profile picture
- **Create Teams**: Create teams with name and logo
- **Assign to Teams**: Assign team members to specific teams
- **Give Feedback**: Provide feedback to individual team members or entire teams
- **Dashboard**: Overview of all teams, members, and feedback

## Technology Stack

- **Bun**: JavaScript runtime and package manager
- **React 19**: Frontend framework
- **TypeScript**: Type safety
- **React Router**: Client-side routing
- **Context API**: State management

## Getting Started

### Prerequisites

- Bun installed on your system

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
# Create production build
npm run build
```

## Application Structure

```
src/
├── components/          # Reusable components
│   └── Navigation.tsx   # Navigation bar
├── context/             # React Context for state management
│   └── AppContext.tsx   # Global app state
├── pages/               # Page components
│   ├── Home.tsx         # Dashboard homepage
│   ├── AddTeamMember.tsx # Add team member form
│   ├── CreateTeam.tsx   # Create team form
│   ├── AssignToTeam.tsx # Assign members to teams
│   └── GiveFeedback.tsx # Feedback form and history
├── types.ts             # TypeScript type definitions
└── App.tsx              # Main application component
```

## Features Overview

### Team Member Management
- Add team members with name, email, and profile picture URL
- View all team members on the dashboard
- Assign members to teams

### Team Management
- Create teams with name and logo URL
- View team overview with member counts
- Manage team assignments

### Feedback System
- Give feedback to individual team members or entire teams
- View feedback history
- Track feedback by target type (team/member)

### State Management
- Uses React Context API for global state
- No external API calls - all data stored in local state
- Persistent during session (resets on page refresh)
