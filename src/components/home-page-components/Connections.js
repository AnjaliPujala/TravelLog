import React, { useEffect, useState } from 'react';
import '../../styles/Connections.css';
import ChatHere from './ChatHere';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, where,query,doc,getDoc } from 'firebase/firestore';
import { db } from '../../firebase/FirebaseInitializer'; 
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
  const handleRemoveConnection = async (userEmail, connectionEmail) => {
    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', userEmail));
      const userDocs = await getDocs(q);
  
      if (!userDocs.empty) {
        const userDoc = userDocs.docs[0];
        const userDocRef = doc(db, 'users', userDoc.id);
        const userDocSnap = await getDoc(userDocRef); // Fetch document snapshot
        if (userDocSnap.exists()) {
          await updateDoc(userDocRef, {
            connections: userDocSnap.data().connections.filter((req) => req.email !== connectionEmail),
          });
        }
      }
  
      const connectionRef = collection(db, 'users');
      const que = query(connectionRef, where('email', '==', connectionEmail));
      const connectionDocs = await getDocs(que);
  
      if (!connectionDocs.empty) {
        const connectionDoc = connectionDocs.docs[0];
        const connectionDocRef = doc(db, 'users', connectionDoc.id);
        const connectionDocSnap = await getDoc(connectionDocRef); // Fetch document snapshot
        if (connectionDocSnap.exists()) {
          await updateDoc(connectionDocRef, {
            connections: connectionDocSnap.data().connections.filter((req) => req.email !== userEmail),
          });
        }
      }
      setConnections((prevConnections) =>
        prevConnections.filter((connection) => connection.email !== connectionEmail)
      );
  
      // Optionally update the user in session storage
      const updatedUser = {
        ...user,
        connections: connections.filter((connection) => connection.email !== connectionEmail),
      };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log(error);
    }
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
            <div>
            <button
              className="chat-btn"
              onClick={() =>
                openChat(user.email, connection.email, user.name, connection.name)
              }
            >
              Chat
            </button>
            <button className='remove-connection' onClick={()=>handleRemoveConnection(user.email,connection.email)}>Remove Connection</button>
            </div>
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
