import React, { useState } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/FirebaseInitializer';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [inputEmail,setInputEmail]=useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [checkOTP, setCheckOTP] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (inputEmail === '' || password === '') {
      alert('Fill the details');
      return;
    }

    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', inputEmail), where('password', '==', password));
      const docs = await getDocs(q);
      if (docs.empty) {
        alert('Invalid email or password');
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
      alert('Error', error);
    }
  };

  const sendResetMail = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Please enter your email to reset your password.');
      return;
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generatedOtp);

    const emailData = {
      subject:"OTP Verification",
      email,
      message: `Here is your OTP : ${generatedOtp}`,
    };

    try {
      await emailjs.send(
        'service_npgj14s',
        'template_5671qrw',
        emailData,
        'SV0XPhI3tDyRALbSk'
      );
      alert(`An OTP has been sent to ${email}.`);
      setIsResettingPassword(true);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword === '') {
      alert('Please enter the new password');
      return;
    }
    if (checkOTP !== otp) {
      alert('Wrong OTP Entered');
      return;
    }

    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', email));
      const docs = await getDocs(q);

      if (docs.empty) {
        alert('Email not found');
      } else {
        const userDoc = docs.docs[0];
        const userDocRef = doc(db, 'users', userDoc.id);
        await updateDoc(userDocRef, { password: newPassword });
        alert('Password updated successfully in Firestore');
        setIsResettingPassword(false);
      }
    } catch (error) {
      alert('Error updating password: ', error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='login-container'>
      <div className='login-header'>
        <h1>Login to TravelLog</h1>
        <p>Explore and share your travel experiences.</p>
      </div>
      <div className='card'>
        <form onSubmit={handleLogin}>
          <input
            placeholder='Email'
            type='email'
            name='email'
            onChange={(e) => setInputEmail(e.target.value)}
            required
          />
          <input
            placeholder='Password'
            type='password'
            name='password'
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type='submit'>Login</button>
        </form>
      </div>
      <div className='toSignup'>
        <p>
          Don't have an account? <Link to='/signup-page'>SignUp</Link>
        </p>
      </div>
      <div className='forgot-password'>
        <form onSubmit={sendResetMail}>
          <input
            type='email'
            name='email'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type='submit'>Forgot Password?</button>
        </form>
      </div>
      {isResettingPassword && (
        <div className='reset-password'>
          <input
            type='text'
            placeholder='Enter Your OTP'
            value={checkOTP}
            onChange={(e) => setCheckOTP(e.target.value)}
          />
          <input
            type='password'
            placeholder='Enter New Password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordUpdate}>Update Password</button>
        </div>
      )}
    </div>
  );
}
