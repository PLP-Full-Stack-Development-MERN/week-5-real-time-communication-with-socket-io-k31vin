# Real-Time Collaborative Notes

A real-time collaborative note-taking application that allows multiple users to create, edit, and view notes simultaneously.

## Features

- **Real-time Collaboration**: Multiple users can edit the same note simultaneously
- **Room-based Collaboration**: Join specific note rooms via unique room IDs
- **User Presence**: See who is currently viewing or editing a note
- **Live Updates**: Changes appear instantly across all connected clients
- **Persistent Storage**: Notes are saved to MongoDB for future access

## Technologies Used

- **Frontend**: React, Socket.io Client
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.io
- **Database**: MongoDB
- **Deployment**: 
  - Backend: Render
  - Frontend: Vercel

## Key Real-Time Concepts

### WebSockets
The application uses WebSockets (via Socket.io) for bidirectional communication between clients and the server, enabling real-time updates without the need for polling.

### Rooms
Socket.io rooms are utilized to create isolated collaboration spaces. When a user joins a specific note (identified by roomId), they enter a virtual "room" where only users in that same room receive updates about changes.

### Event-Based Communication
The application uses events to transmit information:
- `joinRoom`: When a user wants to collaborate on a note
- `updateNote`: When a user modifies a note's content
- `noteUpdated`: When the server broadcasts changes to other clients
- `activeUsers`: To update the list of users currently in a room

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- MongoDB

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/real-time-notes.git
cd real-time-notes
```

2. Set up the backend:
```bash
cd backend
npm install
# Create a .env file with the following content:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/real-time-notes
# FRONTEND_URL=http://localhost:3000
npm start
```

3. Set up the frontend:
```bash
cd frontend
npm install
# Create a .env file with the following content:
# REACT_APP_API_URL=http://localhost:5000
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Create a new note by clicking "Create New Note" on the home page
2. Share the generated Room ID with collaborators
3. Others can join by entering the Room ID on the home page
4. All users can edit the note simultaneously
5. Changes are saved automatically and synchronized across all clients

## Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Link your GitHub repository
3. Set the build command to `npm install`
4. Set the start command to `node server.js`
5. Add environment variables (MONGODB_URI, FRONTEND_URL)

### Frontend (Vercel)
1. Import your GitHub repository to Vercel
2. Set the REACT_APP_API_URL to your deployed backend URL
3. Deploy

## Future Improvements
- User authentication and authorization
- Rich text editing capabilities
- Cursor position tracking for multiple users
- History/versioning of notes
- Offline support with synchronization