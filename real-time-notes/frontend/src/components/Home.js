import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Home.css';

function Home() {
const [roomId, setRoomId] = useState('');
const navigate = useNavigate();

const handleCreateRoom = () => {
const newRoomId = uuidv4().substring(0, 8);
navigate(`/notes/${newRoomId}`);
};

const handleJoinRoom = (e) => {
e.preventDefault();
if (roomId.trim()) {
    navigate(`/notes/${roomId}`);
}
};

return (
<div className="home-container">
    <div className="home-card">
    <h2>Welcome to Collaborative Notes</h2>
    <p>Create a new note or join an existing one</p>
    
    <button 
        className="create-button" 
        onClick={handleCreateRoom}
    >
        Create New Note
    </button>
    
    <div className="divider">
        <span>OR</span>
    </div>
    
    <form onSubmit={handleJoinRoom}>
        <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="room-input"
        />
        <button 
        type="submit" 
        className="join-button"
        disabled={!roomId.trim()}
        >
        Join Note
        </button>
    </form>
    </div>
</div>
);
}

export default Home;