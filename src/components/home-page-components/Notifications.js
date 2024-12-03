import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/FirebaseInitializer'; 
import { collection, query, where, getDocs, updateDoc, doc ,setDoc} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/Notifications.css'; 

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
   

    if (!userData) {
      alert("User not found");
    } else {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (user.email) {
        try {
          const userRef = collection(db, 'users');
          const q = query(userRef, where('email', '==', user.email));
          const userDocs = await getDocs(q);
    
          if (!userDocs.empty) {
            const userDoc = userDocs.docs[0];
            const userData = userDoc.data();
    
          
            const requestsWithNames = await Promise.all(userData.requests.map(async (request) => {
              const { senderEmail, senderName } = request; 
              
              if (senderEmail && senderName) {
                const requesterRef = collection(db, 'users');
                const rq = query(requesterRef, where('email', '==', senderEmail));
                const requesterDocs = await getDocs(rq);
    
                if (!requesterDocs.empty) {
                  return { email: senderEmail, name: senderName };
                }
              }
              return null; 
            }));
    
            
            const validRequests = requestsWithNames.filter(req => req !== null);
            setRequests(validRequests);
          }
        } catch (error) {
          console.error("Error fetching connection requests:", error);
        }
      }
    };
    

    fetchRequests();
  }, [user]);

  const handleRequestResponse = async (requesterEmail, action) => {
    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', user.email));
      const userDocs = await getDocs(q);
  
      if (!userDocs.empty) {
        const userDoc = userDocs.docs[0];
        const userDocRef = doc(db, 'users', userDoc.id);
  
        if (action === 'accept') {
          const requesterRef = collection(db, 'users');
          const rq = query(requesterRef, where('email', '==', requesterEmail));
          const requesterDocs = await getDocs(rq);
  
          if (!requesterDocs.empty) {
            const requesterDoc = requesterDocs.docs[0];
            const requesterData = requesterDoc.data();
  
            
            await updateDoc(userDocRef, {
              connections: [...userDoc.data().connections, { email: requesterEmail, name: requesterData.name }],
            });
  
            const requesterDocRef = doc(db, 'users', requesterDoc.id);
            await updateDoc(requesterDocRef, {
              connections: [...requesterDoc.data().connections, { email: user.email, name: user.name }],
            });
  
           
            sendNotification(requesterEmail, 'accepted', requesterData.name);
            const chatRef = collection(db, 'chats');
            const chatDocRef = doc(chatRef, `${user.email}_${requesterEmail}`);
  
            // Set default values for both users in the chat document
            await setDoc(chatDocRef, {
              email1: {
                email:user.email,
                name: user.name,
                messages: [],
                lastMessage: null,
                timestamp: null,
              },
              email2: {
                email:requesterEmail,
                name: requesterData.name,
                messages: [],
                lastMessage: null,
                timestamp: null,
              },
            });

          }
        } else {
          
          const requesterRef = collection(db, 'users');
          const rq = query(requesterRef, where('email', '==', requesterEmail));
          const requesterDocs = await getDocs(rq);
  
          if (!requesterDocs.empty) {
            const requesterDoc = requesterDocs.docs[0];
            
  
            const requesterDocRef = doc(db, 'users', requesterDoc.id);
  
           
            const updatedSentConnections = requesterDoc.data().sentConnections.filter(email => email !== user.email);
            await updateDoc(requesterDocRef, {
              sentConnections: updatedSentConnections,
            });
            
            
          }
        }
      
        await updateDoc(userDocRef, {
          requests: userDoc.data().requests.filter(request => request.senderEmail !== requesterEmail),
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
    }
  };
  
  const sendNotification = async (receiverEmail, action, requesterName) => {

    alert(`Notification sent to ${receiverEmail}: Request from ${requesterName} has been ${action}`);
  };

  return (
    <div className="notifications-container">
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      <h2>Connection Requests</h2>
      {requests.length > 0 ? (
        requests.map((request) => (
          <div key={request.email} className="request-card">
            {/* Check if the user is already connected */}
            {!user.connections.some(connection => connection.email === request.email) ? (
              <>
                <p><b>{request.name}</b> sent you a connection request.</p>
                <div>
                  <button className="accept" onClick={() => handleRequestResponse(request.email, 'accept')}>
                    Accept
                  </button>
                  <button className="reject" onClick={() => handleRequestResponse(request.email, 'reject')}>
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <p>You are already connected with {request.name}.</p>
            )}
          </div>
        ))
      ) : (
        <p>No new connection requests.</p>
      )}
    </div>
  );
}
