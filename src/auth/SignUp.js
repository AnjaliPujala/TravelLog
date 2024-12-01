import React, { useState } from 'react';
import '../styles/SignUp.css';
import {db} from '../firebase/FirebaseInitializer';
import { collection, addDoc ,query,where,getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
export default function SignUp() {
    const [name,setName]=useState('');
    const navigate=useNavigate();
    const [password,setPassword]=useState('');
    const [confirmPassword,setConfirmPassword]=useState('');
    const [email,setEmail]=useState('');
    const handleSubmit = async (e) =>{
        e.preventDefault();
        if(name === '' || password === '' || confirmPassword==='' || email ==='')
            alert("Fill all the details");
        else if(password !== confirmPassword){
            alert("Password mismatch");
        }else{
            try {
                const userRef=collection(db,'users');
                const q=query(userRef,where('email','==',email));
                const querySnapshot=await getDocs(q);
                if(!querySnapshot.empty){
                    alert("Email alredy registered, please login to your account");
                    return;
                }
                const docRef = await addDoc(collection(db, 'users'), {
                    name,
                    email,
                    password, 
                    createdAt: new Date(),
                });
                const newUser = { id: docRef.id, name, email,password }; 
                sessionStorage.setItem('user', JSON.stringify(newUser));
             
                alert('Signup successful!');
                
                localStorage.setItem('isLoggedIn', 'true');
                setName('');
                setPassword('');
                setConfirmPassword('');
                setEmail('');
                navigate('/home-page');
            } catch (error) {
                console.error('Error adding document: ', error);
                alert('Error signing up. Please try again.');
            }
        }

    }
  return (
    <div className='signup-container'>
      <form className='form' onSubmit={handleSubmit}>
        <input placeholder='Username' type='text' className='form-element' onChange={(e)=>setName(e.target.value)} />
        <input placeholder='Password' type='password' className='form-element' onChange={(e)=>setPassword(e.target.value)} />
        <input placeholder='Confirm Password' type='password' className='form-element' onChange={(e)=>setConfirmPassword(e.target.value)}/>
        <input placeholder='Email' type='email' className='form-element' onChange={(e)=>setEmail(e.target.value)}/>
        <button type='submit'>Submit</button>
      </form>
      <div className='toLogin'>
        <p>Already have an account? <Link to='/login-page'>Login</Link></p>
      </div>
    </div>
  );
}
