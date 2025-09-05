import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landingpage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <h1 className="landing-title">Social Sync</h1>
            <div className="landing-buttons">
                <button
                    className="landing-button"
                    onClick={() => navigate("/signup")}
                >
                    Sign Up
                </button>
                <button
                    className="landing-button"
                    onClick={() => navigate("/login")}
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
