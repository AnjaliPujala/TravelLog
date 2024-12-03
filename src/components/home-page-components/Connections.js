import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Connections.css';

export default function Connections() {
  const [connections, setConnection] = useState([]);
  const navigate = useNavigate(); // Use the navigate function for routing
    const [user,setUser]=useState('');
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));

    if (!userData) {
      return;
    } else {
      setConnection(userData.connections);
      setUser(userData);
    }
  }, []);

  const handleChatClick = (email1, email2) => {
    navigate(`/chat/${email1}/${email2}`); 
  };

  return (
    <div className='connections-container'>
      <div className='title'>
        <h2>Your connections 🫂</h2>
        <button className='connections-back-btn' onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {connections.length === 0 ? (
        <h4>You don't have any connections</h4>
      ) : (
        connections.map((connection) => (
          <div key={connection.email} className='connection'>
            <p>{connection.name}</p>
            <button onClick={() => handleChatClick(user.email,connection.email)}>
              Chat
            </button>
          </div>
        ))
      )}
    </div>
  );
}
