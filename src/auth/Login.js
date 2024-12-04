import React, { useState } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/FirebaseInitializer';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const sendResetMail = () => {
    if (!email) {
      alert("Please enter your email to reset your password");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Reset mail sent to your inbox");
        console.log("Password reset email sent successfully");
        setIsResettingPassword(true);
      })
      .catch((err) => {
        console.error(err);
        alert("Error sending reset email: ", err.message);
      });
  };

  const handlePasswordUpdate = async () => {
    if (newPassword === '') {
      alert("Please enter the new password");
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
        alert("Password updated successfully in Firestore");
        setIsResettingPassword(false);
      }
    } catch (error) {
      alert("Error updating password: ", error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
        <Link to="#" onClick={sendResetMail}>Forgot Password?</Link>
      </div>

      {isResettingPassword && (
        <div className='reset-password'>
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordUpdate}>Update Password</button>
        </div>
      )}
    </div>
  );
}
