import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/FirebaseInitializer'; 
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
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
            setRequests(userData.requests || []);
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
         
          await updateDoc(userDocRef, {
            connections: [...userDoc.data().connections, requesterEmail], 
          });

          const requesterRef = collection(db, 'users');
          const rq = query(requesterRef, where('email', '==', requesterEmail));
          const requesterDocs = await getDocs(rq);

          if (!requesterDocs.empty) {
            const requesterDoc = requesterDocs.docs[0];
            const requesterDocRef = doc(db, 'users', requesterDoc.id);

           
            await updateDoc(requesterDocRef, {
              connections: [...requesterDoc.data().connections, user.email], 
            });
          }

          sendNotification(requesterEmail, 'accepted');
        }

     
        await updateDoc(userDocRef, {
          requests: userDoc.data().requests.filter(email => email !== requesterEmail),
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
    }
  };

  
  const sendNotification = async (receiverEmail, action) => {
    console.log(`Notification sent to ${receiverEmail}: Request has been ${action}`);
    alert(`Notification sent to ${receiverEmail}: Request has been ${action}`);
  };

  return (
    <div className="notifications-container">
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      <h2>Connection Requests</h2>
      {requests.length > 0 ? (
        requests.map((requesterEmail) => (
          <div key={requesterEmail} className="request-card">
           
            {!user.connections.includes(requesterEmail) ? (
              <>
                <p>{requesterEmail} sent you a connection request.</p>
                <div>
                  <button className="accept" onClick={() => handleRequestResponse(requesterEmail, 'accept')}>
                    Accept
                  </button>
                  <button className="reject" onClick={() => handleRequestResponse(requesterEmail, 'reject')}>
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        ))
      ) : (
        <p>No new connection requests.</p>
      )}
    </div>
  );
}
