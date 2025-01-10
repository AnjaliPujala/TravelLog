import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/FirebaseInitializer'; 
import { collection, query, where, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/Notifications.css'; 
import emailjs from '@emailjs/browser';

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState({});
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

            const requestsWithNames = await Promise.all(
              userData.requests.map(async (request) => {
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
              })
            );

            const validRequests = requestsWithNames.filter((req) => req !== null);
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

            // Update connections for both users
            await updateDoc(userDocRef, {
              connections: [...(userDoc.data().connections || []), { email: requesterEmail, name: requesterData.name }],
            });

            const requesterDocRef = doc(db, 'users', requesterDoc.id);
            await updateDoc(requesterDocRef, {
              connections: [...(requesterDoc.data().connections || []), { email: user.email, name: user.name }],
              sentConnections:requesterDoc.data().sentConnections.filter((req) => req.email !== user.email)
            });

            // Create a chat document
            const chatRef = collection(db, 'chats');
            const chatDocRef = doc(chatRef, `${user.email}_${requesterEmail}`);
            await setDoc(chatDocRef, {
              email1: {
                email: user.email,
                name: user.name,
                messages: [],
                lastMessage: null,
                timestamp: null,
              },
              email2: {
                email: requesterEmail,
                name: requesterData.name,
                messages: [],
                lastMessage: null,
                timestamp: null,
              },
            });
            await updateDoc(userDocRef, {
              requests: userDoc.data().requests.filter((req) => req.senderEmail !== requesterEmail),
            });
            
            // Send notification email
            sendNotification(requesterEmail, 'accepted', requesterData.name);

            // Update local state
            setRequests((prevRequests) =>
              prevRequests.filter((req) => req.email !== requesterEmail)
            );
          }
        } else {
          // Reject the request
          await updateDoc(userDocRef, {
            requests: userDoc.data().requests.filter((req) => req.senderEmail !== requesterEmail),
          });

          const requesterRef = collection(db, 'users');
          const rq = query(requesterRef, where('email', '==', requesterEmail));
          const requesterDocs = await getDocs(rq);

          if (!requesterDocs.empty) {
            const requesterDoc = requesterDocs.docs[0];
            const requesterDocRef = doc(db, 'users', requesterDoc.id);

            // Filter out the rejected user's email from sentConnections
           

            // Update the requester's sentConnections field
            await updateDoc(requesterDocRef, {
              sentConnections:requesterDoc.data().sentConnections.filter((req) => req.email !== user.email)
            });


            sendNotification(requesterEmail, 'rejected', requesterDoc.data().name);
          }

          setRequests((prevRequests) =>
            prevRequests.filter((req) => req.email !== requesterEmail)
          );
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
    }
  };

  const sendNotification = async (receiverEmail, action, requesterName) => {
    const emailData = {
      subject: "Update from sent requests",
      email: receiverEmail,
      message: `Hello ${requesterName},\nYour request to ${user.name} is ${action}.\nThank you,\nTravelLog.`,
    };
    try {
      await emailjs.send(
        'service_npgj14s',
        'template_5671qrw',
        emailData,
        'SV0XPhI3tDyRALbSk'
      );
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <div className="notifications-container">
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      <h2>Connection Requests</h2>
      {requests.length > 0 ? (
        requests.map((request) => (
          <div key={request.email} className="request-card">
            {!user.connections?.some((connection) => connection.email === request.email) ? (
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
