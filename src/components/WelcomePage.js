import React from 'react';
import '../styles/WelcomePage.css'; // Import the corresponding CSS file
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/login-page');
    };

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <h1 className="welcome-title">Welcome to TravelLog</h1>
                <div className="bubble bubble-4"></div>
                <p className="welcome-description">
                    Your journey starts here. Explore, plan, and track your travels with ease.
                </p>
                <button className="welcome-button" onClick={handleClick}>
                    Start Your Adventure
                </button>
                <div className="bubble bubble-3"></div>
            </div>
           
                <div className="bubble bubble-6"></div>
                
         
            <div className="travel-images">
                <img className="image-airplane" src="https://freepngimg.com/thumb/airplane/26564-3-airplane-photos.png" alt="Airplane" />
               
                
                <div className="bubble bubble-5"></div>
            </div>
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
        </div>
    );
};

export default WelcomePage;
