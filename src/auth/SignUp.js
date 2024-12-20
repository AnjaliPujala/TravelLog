import React, { useState } from 'react';
import '../styles/SignUp.css';
import { db } from '../firebase/FirebaseInitializer';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading,setLoading]=useState(false);
  const navigate = useNavigate();

  const handleManualSignUp = async (e) => {
    e.preventDefault();

    if (name === '' || password === '' || confirmPassword === '' || email === '') {
      alert('Fill all the details');
      return;
    }
    if (password !== confirmPassword) {
      alert('Password mismatch');
      return;
    }
    
    try {
      setLoading(true);
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('Email already registered, please login to your account');
        return;
      }

      
      const docRef = await addDoc(collection(db, 'users'), {
        name,
        email,
        password,
        photoURL: '',
        sentConnections:[],
        requests:[],
        connections:[], 
        createdAt: new Date(),
      });

      const newUser = { id: docRef.id, name, email, photoURL: '',sentConnections:[],requests:[],connections:[] };
      sessionStorage.setItem('user', JSON.stringify(newUser));

      setLoading(false);
      localStorage.setItem('isLoggedIn', 'true');
      setName('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
      navigate('/home-page');
    } catch (error) {
      console.error('Error signing up: ', error);
      alert('Error signing up. Please try again.');
    }
  };

  
  if(loading){
    return <div>Loading...</div>
  }
  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <div className="signup-options">
        <div className="manual-signup">
     
          <form className="form" onSubmit={handleManualSignUp}>
            <input
              placeholder="Username"
              type="text"
              className="form-element"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              className="form-element"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              placeholder="Confirm Password"
              type="password"
              className="form-element"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <input
              placeholder="Email"
              type="email"
              className="form-element"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        
      </div>

      <div className="toLogin">
        <p>
          Already have an account? <Link to="/login-page">Login</Link>
        </p>
      </div>
    </div>
  );
}
