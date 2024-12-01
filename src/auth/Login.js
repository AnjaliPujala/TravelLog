import React, { useState } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/FirebaseInitializer';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        alert("Login successful");
        const userDoc = docs.docs[0];  
        const user = {
        id: userDoc.id,              
        ...userDoc.data(),
        };
        sessionStorage.setItem('user', JSON.stringify(user));
        console.log("User",user);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/home-page');
      }
    } catch (error) {
      alert("Error", error);
    }
  };

  return (
    <div className='login-container'>
      <div className='card'>
        <input placeholder='Email' type='email' onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder='Password' type='password' onChange={(e) => setPassword(e.target.value)} required />
        <button type='submit' onClick={handleLogin}>Login</button>
      </div>
      <div className='toSignup'>
        <p>Don't have an account? <Link to='/signup-page'>SignUp</Link></p>
      </div>
    </div>
  );
}
