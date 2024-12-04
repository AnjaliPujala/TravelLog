import React, { useState, useEffect } from 'react';

import { db } from '../../firebase/FirebaseInitializer';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import '../../styles/ChatHere.css';

export default function ChatHere({email1,email2,receiver}) {
 
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
 
  const [user, setUser] = useState('');

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));

    if (!userData) {
      return;
    } else {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    let unsubscribe;

    const fetchChatData = async () => {
      try {
        const possibleChatIds = [`${email1}_${email2}`, `${email2}_${email1}`]; // Both possible chat document IDs
        let resolvedChatId = null;

        for (const id of possibleChatIds) {
          const chatRef = doc(db, 'chats', id);
          const chatDoc = await getDoc(chatRef);
          if (chatDoc.exists()) {
            resolvedChatId = id;
            setChatId(resolvedChatId);

            // Real-time listener setup
            unsubscribe = onSnapshot(chatRef, (doc) => {
              if (doc.exists()) {
                const chatData = doc.data();
                setMessages(chatData.messages || []);
              }
            });

            break;
          }
        }

        if (!resolvedChatId) {
          console.log('No chat document found for the provided emails.');
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Cleanup the listener when the component unmounts or email params change
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [email1, email2]); // Re-fetch data when email1 or email2 changes

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !chatId) return;

    const timestamp = new Date().toLocaleString();
    const newMsg = {
      name: user.name,
      sender: email1,
      receiver: email2,
      content: newMessage,
      timestamp: timestamp,
    };

    try {
      const chatRef = doc(db, 'chats', chatId);
      const updatedMessages = [...messages, newMsg];

      // Update Firestore document with the new message
      await updateDoc(chatRef, {
        messages: updatedMessages,
        lastMessage: newMessage,
        timestamp: timestamp,
      });

      // Reset the input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <p>Loading chat...</p>;

  if (!chatId) return <p>No chat available for the provided emails.</p>;

  return (
    <div className="chat-container">
      <h5>Chat with {receiver}</h5>
      

      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === email1 ? 'sender' : 'receiver'}`}
          >
            <p>{message.content}</p>
            <div className="footer">
              <small>{message.timestamp}</small>
              <small>{message.name}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="send-message">
        <input
          type="text"
          placeholder="Type here"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
