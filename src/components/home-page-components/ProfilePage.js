import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ProfilePage.css';
import { db } from '../../firebase/FirebaseInitializer';

import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);  
  const [updatedName, setUpdatedName] = useState('');
 
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));

    if (!userData) {
      navigate('/login-page');
    } else {
      setUser(userData);
      setUpdatedName(userData.name || '');
     
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login-page');
  };

  const handleBack = () => {
    navigate(-1); 
  };

  const handleEditProfile = () => {
    setIsEditing(true);  
  };

  const handleSaveProfile = async() => {
    if(updatedName === ''){
        alert("Fill the details");
        return;
    }
    const updatedUser = { ...user, name: updatedName };
    setUser(updatedUser);
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where('email', '==', user.email));
        const docs = await getDocs(q);
        
        if (docs.empty) {
          alert("Email not found");
        } else {
          const userDoc = docs.docs[0];
          const userDocRef = doc(db, 'users', userDoc.id);
          await updateDoc(userDocRef, { name: updatedName });
         
        }
      } catch (error) {
        alert("Error updating password: ", error);
      }
    sessionStorage.setItem('user', JSON.stringify(updatedUser));  
    setIsEditing(false);  
  };

  const handleCancelEdit = () => {
    setIsEditing(false);  
  };

  console.log("user photo", user);
  
  return (
    <div className="profile-container">
      <div className="profile-card">
        {user ? (
          <>
            <img
              src={user.photoURL!=="" ?user.photoURL:'https://via.placeholder.com/150'}
              alt="Profile"
              className="profile-dp"
            />
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>

            <button className="back-btn" onClick={handleBack}>
              Back
            </button>

            <button className="edit-btn" onClick={handleEditProfile}>
              Edit User Name
            </button>

            {isEditing && (
              <div className="edit-form">
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  placeholder="Update Name"
                />
                
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>Save</button>
                  <button className='cancel-btn' onClick={handleCancelEdit}>Cancel</button>
                </div>
              </div>
            )}

            <button className="sign-out-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
