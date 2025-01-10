import React, { useState,useEffect } from 'react';
import '../styles/SignUp.css';
import { db } from '../firebase/FirebaseInitializer';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

export default function SignUp() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [OTP, setOTP] = useState('');
  const [inputOTP, setInputOTP] = useState("");
  const navigate = useNavigate();
  
  const handleManualSignUp = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (name === '' || password === '' || confirmPassword === '' || email === '') {
      alert('Fill all the details');
      return;
    }
    if (password !== confirmPassword) {
      alert('Password mismatch');
      return;
    }
    
    try {
      setLoading(true); // Start loading

      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('Email already registered, please login to your account');
        setLoading(false); // Stop loading
        return;
      }
      
      // Generate and send OTP
      await handleSendEmail();

    } catch (error) {
      console.error('Error signing up: ', error);
      alert('Error signing up. Please try again.');
      setLoading(false); // Stop loading
    }
  };

  const handleSendEmail = async () => {
    // Generate a 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOTP(generatedOtp); // Store OTP in state
  
    const emailData = {
      email,
      message: generatedOtp,
    };
  
    try {
      setLoading(true); // Start loading
      await emailjs.send(
        'service_l6tifis',
        'template_5671qrw',
        emailData,
        'SV0XPhI3tDyRALbSk'
      );
      setIsOTPSent(true); 
      alert(`An OTP has been sent to ${email}. Please verify it`);
      // Show OTP input UI
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  const handleVerifyOTP = async () => {
    // Validate OTP
    if (OTP !== inputOTP) {
      alert("Incorrect OTP entered");
      return;
    }

    // Prepare user data
    const userData = {
      name: name,
      email: email,
      password: password, // Ideally, hash passwords before storing
      photoURL: '',
      sentConnections: [],
      requests: [],
      connections: [],
      isVerified: true, // Mark the user as verified
      createdAt: new Date(),
    };

    try {
      setLoading(true); // Start loading

      // Add user data to Firestore
      const docRef = await addDoc(collection(db, 'users'), userData);
      
      // Store user in session and local storage
      const newUser = { id: docRef.id, ...userData };
      sessionStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('isLoggedIn', 'true');

      

      // Send confirmation email
      const confirmationData = {
        email,
        name: name,
      };
      
      await emailjs.send(
        'service_l6tifis',
        'template_8mxbqzk',
        confirmationData,
        'SV0XPhI3tDyRALbSk'
      );

      // Reset form fields
      setName('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
      setInputOTP('');
      setIsOTPSent(false);

      // Redirect to homepage
      navigate('/home-page');
    } catch (error) {
      console.error('Error verifying OTP or adding user data:', error);
      alert('Failed to complete signup. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="signup-container">
        {!isOTPSent ? (<div>
          <h2>Sign Up</h2>
          <div className="signup-options">
            <div className="manual-signup">
              <form className="form" onSubmit={handleManualSignUp}>
                <input
                  placeholder="Username"
                  type="text"
                  className="form-element"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  placeholder="Password"
                  type="password"
                  className="form-element"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  placeholder="Confirm Password"
                  type="password"
                  className="form-element"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <input
                  placeholder="Email"
                  type="email"
                  className="form-element"
                  value={email}
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
        </div>):(<div className='verify-otp'>
          <h3>Enter your OTP that was sent to your email</h3>
          <input 
            placeholder='OTP' 
            type='text' 
            value={inputOTP}
            onChange={(e) => setInputOTP(e.target.value)}
          />
          <button onClick={handleVerifyOTP}>Verify</button>
        </div>
      )}
    </div>
  );
}
