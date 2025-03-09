const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
cors: {
origin: process.env.FRONTEND_URL || 'http://localhost:3000',
methods: ['GET', 'POST']
}
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-time-notes')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Note model
const noteSchema = new mongoose.Schema({
title: String,
content: String,
roomId: String,
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// Socket.io connection
io.on('connection', (socket) => {
console.log('New client connected:', socket.id);

// Join a room
socket.on('joinRoom', async (roomId) => {
socket.join(roomId);
console.log(`User ${socket.id} joined room: ${roomId}`);

// Notify others in the room
socket.to(roomId).emit('userJoined', { userId: socket.id });

// Send current note to the user
try {
    const note = await Note.findOne({ roomId });
    if (note) {
    socket.emit('loadNote', note);
    }
} catch (error) {
    console.error('Error loading note:', error);
}

// Update active users list
const roomSockets = io.sockets.adapter.rooms.get(roomId);
const activeUsers = roomSockets ? Array.from(roomSockets) : [];
io.to(roomId).emit('activeUsers', activeUsers);
});

// Leave a room
socket.on('leaveRoom', (roomId) => {
socket.leave(roomId);
console.log(`User ${socket.id} left room: ${roomId}`);

// Notify others in the room
socket.to(roomId).emit('userLeft', { userId: socket.id });

// Update active users list
const roomSockets = io.sockets.adapter.rooms.get(roomId);
const activeUsers = roomSockets ? Array.from(roomSockets) : [];
io.to(roomId).emit('activeUsers', activeUsers);
});

// Update note content
socket.on('updateNote', async (data) => {
const { roomId, content, title } = data;

try {
    // Find and update the note, or create if it doesn't exist
    let note = await Note.findOne({ roomId });
    
    if (note) {
    note.content = content;
    if (title) note.title = title;
    note.updatedAt = Date.now();
    await note.save();
    } else {
    note = await Note.create({
        title: title || 'Untitled Note',
        content,
        roomId
    });
    }
    
    // Broadcast the updated note to all users in the room except sender
    socket.to(roomId).emit('noteUpdated', {
    content,
    title: note.title,
    updatedAt: note.updatedAt
    });
} catch (error) {
    console.error('Error updating note:', error);
}
});

// Disconnect
socket.on('disconnect', () => {
console.log('Client disconnected:', socket.id);
});
});

// REST API endpoints
app.get('/api/notes/:roomId', async (req, res) => {
try {
const note = await Note.findOne({ roomId: req.params.roomId });
if (!note) {
    return res.status(404).json({ message: 'Note not found' });
}
res.json(note);
} catch (error) {
res.status(500).json({ message: 'Server error', error: error.message });
}
});

app.post('/api/notes', async (req, res) => {
try {
const { title, content, roomId } = req.body;
let note = await Note.findOne({ roomId });

if (note) {
    note.title = title;
    note.content = content;
    note.updatedAt = Date.now();
    await note.save();
} else {
    note = await Note.create({
    title,
    content,
    roomId
    });
}

res.status(201).json(note);
} catch (error) {
res.status(500).json({ message: 'Server error', error: error.message });
}
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});