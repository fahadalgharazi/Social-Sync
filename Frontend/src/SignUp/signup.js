import React, { useState } from "react";
import { supabase } from "../supabase"; // Import your Supabase client
import { useNavigate } from "react-router-dom";
import "./signup.css";

const SignupPage = ({ setUserData }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        bio: "",
        interests: "",
        zip: "", // New field for ZIP code
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            confirmPassword,
            gender,
            bio,
            interests,
            zip,
        } = formData;
    
        if (password !== confirmPassword) {
            setError("Passwords do not match. Please try again.");
            return;
        }
    
        try {
            // Fetch the city using the ZIP code
            const zipResponse = await fetch(`https://api.zippopotam.us/us/${zip}`);
            if (!zipResponse.ok) {
                throw new Error("Invalid ZIP code. Unable to fetch location data.");
            }
    
            const zipData = await zipResponse.json();
            const city = zipData.places[0]["place name"]; // Extract the city name
    
            // Sign up the user in Supabase Authentication
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });
    
            if (authError) {
                throw authError;
            }
    
            // Get the user ID from the authentication response
            const userId = authData.user.id;
    
            // Insert user data into the 'users' table
            const { error: userInsertError } = await supabase.from("users").insert([
                {
                    id: userId, // Use the same ID from authentication
                    email,
                    password, // WARNING: Avoid storing plaintext passwords in production
                    created_at: new Date(),
                    username,
                },
            ]);
    
            if (userInsertError) {
                throw userInsertError;
            }
    
            // Insert additional user data into the 'user_data' table
            const { error: userDataInsertError } = await supabase.from("user_data").insert([
                {
                    id: userId, // Use the same ID from authentication
                    first_name: firstName,
                    last_name: lastName,
                    username,
                    gender,
                    bio,
                    city, // Save the city to the database
                    interests: interests.split(",").map((item) => item.trim()), // Convert interests into an array
                    created_at: new Date(),
                },
            ]);
    
            if (userDataInsertError) {
                throw userDataInsertError;
            }
    
            // Save user data locally (optional)
            setUserData({ email, firstName, lastName, username, gender, bio, city, interests });
    
            // Redirect to the questionnaire page
            navigate("/questionnaire"); // Redirect to the questionnaire page
        } catch (error) {
            console.error("Error during sign-up:", error.message);
            setError("Failed to sign up. Please try again.");
        }
    };
    

    return (
        <div className="signup-container">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter a valid email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                        type="text"
                        name="zip"
                        placeholder="Enter your ZIP code"
                        value={formData.zip}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="nonbinary">Non-binary</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Bio</label>
                    <textarea
                        name="bio"
                        placeholder="Write a bio about yourself"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>
                <div className="form-group">
                    <label>Interests</label>
                    <textarea
                        name="interests"
                        placeholder="List your interests (e.g., reading, gaming)"
                        value={formData.interests}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="signup-submit-btn">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignupPage;
