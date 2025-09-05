import React, { useState, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import SignupPage from './SignUp/signup';
import LoginPage from './Login/login';
import Questionnaire from './Questionnaire/questionnaire';
import LandingPage from './Landing_Page/landingpage';
import ProfilePage from './Profile_Page/profilepage';
import { supabase } from './supabase'; // Import Supabase client
import './App.css';

function App() {
    const [personalityResult, setPersonalityResult] = useState({});
    const [userCluster, setUserCluster] = useState("");
    const [userData, setUserData] = useState({});
    const [user, setUser] = useState(null); // State to track the logged-in user

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
        };

        getSession();

        // Listen for authentication state changes
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Cleanup subscription on component unmount
        return () => {
            if (subscription?.subscription) {
                subscription.subscription.unsubscribe(); // Correct usage for unsubscribing
            }
        };
    }, []);

    // Protect routes by checking if the user is logged in
    const ProtectedRoute = ({ children }) => {
        if (!user) {
            return <Navigate to="/login" />;
        }
        return children;
    };

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignupPage setUserData={setUserData} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/questionnaire"
                    element={
                        <ProtectedRoute>
                            <Questionnaire setPersonalityResult={setPersonalityResult} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage
                                personalityResult={personalityResult}
                                setUserCluster={setUserCluster}
                            />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </HashRouter>
    );
}

export default App;
