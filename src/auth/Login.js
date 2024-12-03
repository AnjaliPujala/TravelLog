import React, { useState } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/FirebaseInitializer';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,setLoading]=useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    if (email === '' || password === '') {
      alert("Fill the details");
      return;
    }

    try {
      
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', email), where('password', '==', password));
      const docs = await getDocs(q);
      if (docs.empty) {
        alert("Invalid email or password");
      } else {
        setLoading(true);
        const userDoc = docs.docs[0];  
        const user = {
          id: userDoc.id, 
          photoURL: null, 
          ...userDoc.data(),
        };
        sessionStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        setLoading(false);
        navigate('/home-page');
      }
    } catch (error) {
      alert("Error", error);
    }
  };

  const handleForgotPassword = () => {
    setIsModalOpen(true); 
  };

  const handlePasswordUpdate = async () => {
    if (newPassword === '' || confirmPassword === '') {
      alert("Please fill in both fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', email));
      const docs = await getDocs(q);
      
      if (docs.empty) {
        alert("Email not found");
      } else {
        const userDoc = docs.docs[0];
        const userDocRef = doc(db, 'users', userDoc.id);
        await updateDoc(userDocRef, { password: newPassword });
        alert("Password updated successfully");
        setIsModalOpen(false); 
      }
    } catch (error) {
      alert("Error updating password: ", error);
    }
  };
if(loading){
  return <div>Loading...</div>
}
  return (
    <div className='login-container'>
      <div className='card'>
        <input
          placeholder='Email'
          type='email'
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder='Password'
          type='password'
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type='submit' onClick={handleLogin}>Login</button>
      </div>
      <div className='toSignup'>
        <p>Don't have an account? <Link to='/signup-page'>SignUp</Link></p>
      </div>
      <div className='forgot-password'>
        <Link to="#" onClick={handleForgotPassword}>Forgot Password?</Link>
      </div>

    
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Reset Password</h2>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handlePasswordUpdate}>Update Password</button>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
