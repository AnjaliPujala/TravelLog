import React, { useState } from 'react';
import '../styles/SignUp.css';
import { db } from '../firebase/FirebaseInitializer';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
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
        createdAt: new Date(),
      });

      const newUser = { id: docRef.id, name, email, photoURL: '' };
      sessionStorage.setItem('user', JSON.stringify(newUser));

      alert('Signup successful!');
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

  const handleGoogleSignUp = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const { displayName, email: googleEmail, photoURL } = user;

      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', googleEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('Email already registered, please login to your account');
        return;
      }

     
      const docRef = await addDoc(collection(db, 'users'), {
        name: displayName || 'User', 
        email: googleEmail,
        password: '', 
        photoURL,
        createdAt: new Date(),
      });
    
      const newUser = { id: docRef.id, name: displayName || 'User', email: googleEmail, photoURL };
      sessionStorage.setItem('user', JSON.stringify(newUser));

      alert('Signup successful!');
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/home-page');
    } catch (error) {
      console.error('Error signing up: ', error);
      alert('Error signing up with Google. Please try again.');
    }
  };

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

        <div className="google-signup">
       
          <button onClick={handleGoogleSignUp}>Sign Up with Google</button>
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
