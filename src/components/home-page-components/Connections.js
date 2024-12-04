import React, { useEffect, useState } from 'react';
import '../../styles/Connections.css';
import ChatHere from './ChatHere';
import { useNavigate } from 'react-router-dom';

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [chatData, setChatData] = useState(null); 
  const [user, setUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData) {
      setConnections(userData.connections);
      setUser(userData);
    }
  }, []);

  const openChat = (email1, email2, sender, receiver) => {
    setChatData({ email1, email2, sender, receiver }); 
  };

  const closeChat = () => {
    setChatData(null); 
  };

  return (
    <div className={`connections-container ${chatData ? 'hide-sidebar' : ''}`}>
      <div className="title">
        <h2>Your Connections 🫂</h2>
        <button className="connections-back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {!connections.length ? (
        <h4>You don't have any connections</h4>
      ) : (
        connections.map((connection) => (
          <div key={connection.email} className="connection">
            <p>{connection.name}</p>
            <button
              className="chat-btn"
              onClick={() =>
                openChat(user.email, connection.email, user.name, connection.name)
              }
            >
              Chat
            </button>
          </div>
        ))
      )}

      {/* Chat Modal */}
      {chatData && (
        <div className="modal">
          <div className="modal-content">
            <ChatHere
              email1={chatData.email1}
              email2={chatData.email2}
              receiver={chatData.receiver}
            />
            <button className="close-button" onClick={closeChat}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
