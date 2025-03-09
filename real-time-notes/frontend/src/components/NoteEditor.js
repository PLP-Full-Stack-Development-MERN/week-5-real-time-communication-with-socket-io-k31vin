import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import './NoteEditor.css';

function NoteEditor() {
const { roomId } = useParams();
const navigate = useNavigate();
const [socket, setSocket] = useState(null);
const [note, setNote] = useState({ title: 'Untitled Note', content: '' });
const [activeUsers, setActiveUsers] = useState([]);
const [isConnected, setIsConnected] = useState(false);
const [lastSaved, setLastSaved] = useState(null);
const [editingUser, setEditingUser] = useState(null);

const contentRef = useRef(null);
const titleRef = useRef(null);
const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Initialize socket connection
useEffect(() => {
const newSocket = io(serverUrl);
setSocket(newSocket);

return () => {
    newSocket.disconnect();
};
}, [serverUrl]);

// Socket event handlers
useEffect(() => {
if (!socket) return;

socket.on('connect', () => {
    setIsConnected(true);
    socket.emit('joinRoom', roomId);
});

socket.on('disconnect', () => {
    setIsConnected(false);
});

socket.on('loadNote', (loadedNote) => {
    setNote(loadedNote);
    setLastSaved(new Date(loadedNote.updatedAt).toLocaleTimeString());
});

socket.on('noteUpdated', (updatedData) => {
    setNote(prevNote => ({
    ...prevNote,
    ...updatedData
    }));
    setLastSaved(new Date().toLocaleTimeString());
    setEditingUser("Someone");
    
    // Clear editing notification after 2 seconds
    setTimeout(() => {
    setEditingUser(null);
    }, 2000);
});

socket.on('userJoined', (data) => {
    // Display notification
});

socket.on('userLeft', (data) => {
    // Display notification
});

socket.on('activeUsers', (users) => {
    setActiveUsers(users);
});

return () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('loadNote');
    socket.off('noteUpdated');
    socket.off('userJoined');
    socket.off('userLeft');
    socket.off('activeUsers');
};
}, [socket, roomId]);

// Fetch note on initial load
useEffect(() => {
if (!roomId) return;

const fetchNote = async () => {
    try {
    const response = await axios.get(`${serverUrl}/api/notes/${roomId}`);
    setNote(response.data);
    setLastSaved(new Date(response.data.updatedAt).toLocaleTimeString());
    } catch (error) {
    // Note doesn't exist yet
    if (error.response && error.response.status !== 404) {
        console.error('Error fetching note:', error);
    }
    }
};

fetchNote();
}, [roomId, serverUrl]);

// Handle content changes and emit to socket
const handleContentChange = (e) => {
const newContent = e.target.value;
setNote(prevNote => ({ ...prevNote, content: newContent }));

if (socket && isConnected) {
    socket.emit('updateNote', {
    roomId,
    content: newContent,
    title: note.title
    });
}
};

// Handle title changes and emit to socket
const handleTitleChange = (e) => {
const newTitle = e.target.value;
setNote(prevNote => ({ ...prevNote, title: newTitle }));

if (socket && isConnected) {
    socket.emit('updateNote', {
    roomId,
    content: note.content,
    title: newTitle
    });
}
};

// Save note to database
const saveNote = async () => {
try {
    await axios.post(`${serverUrl}/api/notes`, {
    title: note.title,
    content: note.content,
    roomId
    });
    setLastSaved(new Date().toLocaleTimeString());
} catch (error) {
    console.error('Error saving note:', error);
}
};

// Leave room
const leaveRoom = () => {
if (socket) {
    socket.emit('leaveRoom', roomId);
}
navigate('/');
};

// Copy room ID to clipboard
const copyRoomId = () => {
navigator.clipboard.writeText(roomId);
alert(`Room ID copied: ${roomId}`);
};

return (
<div className="editor-container">
    <div className="editor-header">
    <div className="editor-status">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        {lastSaved && <span className="last-saved">Last saved: {lastSaved}</span>}
        {editingUser && <span className="editing-status">{editingUser} is editing...</span>}
    </div>
    
    <div className="editor-actions">
        <button className="action-button" onClick={saveNote}>Save</button>
        <button className="action-button" onClick={copyRoomId}>Copy Room ID</button>
        <button className="action-button" onClick={leaveRoom}>Exit</button>
    </div>
    </div>
    
    <div className="editor-main">
    <div className="note-panel">
        <input
        ref={titleRef}
        type="text"
        className="note-title"
        value={note.title}
        onChange={handleTitleChange}
        placeholder="Untitled Note"
        />
        
        <textarea
        ref={contentRef}
        className="note-content"
        value={note.content}
        onChange={handleContentChange}
        placeholder="Start typing your note here..."
        ></textarea>
    </div>
    
    <div className="users-panel">
        <h3>Active Users ({activeUsers.length})</h3>
        <ul className="users-list">
        {activeUsers.map((userId, index) => (
            <li key={index} className="user-item">
            <span className="user-avatar">👤</span>
            <span className="user-id">{userId === socket?.id ? 'You' : `User ${index + 1}`}</span>
            </li>
        ))}
        </ul>
        <div className="room-info">
        <p>Room ID: {roomId}</p>
        <p>Share this ID with others to collaborate</p>
        </div>
    </div>
    </div>
</div>
);
}

export default NoteEditor;