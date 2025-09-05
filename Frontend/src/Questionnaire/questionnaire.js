import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./questionnaire.css";
import { supabase } from "../supabase"; 

const Questionnaire = ({ setPersonalityResult }) => {
    const [responses, setResponses] = useState({});
    const navigate = useNavigate();

    const questions = {
        Extraversion: [
            "I enjoy meeting new people and building connections.",
            "I feel energized after spending time with groups of people.",
            "I am comfortable initiating conversations with others.",
        ],
        "Emotional Stability": [
            "I remain calm and composed under stressful situations.",
            "I rarely feel overwhelmed by unexpected challenges.",
            "I am good at managing my emotions when things don't go as planned.",
        ],
        Agreeableness: [
            "I find it easy to get along with people who have different opinions.",
            "I enjoy helping others and making them feel comfortable.",
            "I try to avoid arguments and disagreements.",
        ],
        Conscientiousness: [
            "I am very organized in my daily activities and tasks.",
            "I always meet deadlines for tasks or assignments.",
            "I pay close attention to detail in my work.",
        ],
        Openness: [
            "I enjoy trying new activities or exploring unfamiliar topics.",
            "I like to think about abstract or complex ideas.",
            "I am open to learning and experiencing new cultures or lifestyles.",
        ],
    };

    const handleSelect = (trait, questionIndex, value) => {
        setResponses((prev) => {
            const updated = { ...prev, [`${trait}-${questionIndex}`]: parseInt(value) };
            console.log("Updated responses:", updated);
            return updated;
        });
    };

    const calculateResults = async () => {
        const results = {};
        
        // Step 1: Calculate raw trait averages
        for (let trait in questions) {
            const traitResponses = Object.keys(responses)
                .filter((key) => key.startsWith(trait))
                .map((key) => responses[key]);
    
            const average =
                traitResponses.reduce((sum, val) => sum + val, 0) / questions[trait].length;
    
            results[trait] = average;
        }
        results.openEnded = responses.openEnded; // Include open-ended response
    
        console.log("Raw trait averages:", results);
    
        // Step 2: Population norms for z-score standardization
        const populationNorms = {
            Extraversion: { mean: 3.30, stdDev: 0.70 },
            Neuroticism: { mean: 2.90, stdDev: 0.75 },
            Agreeableness: { mean: 3.60, stdDev: 0.60 },
            Conscientiousness: { mean: 3.40, stdDev: 0.65 },
            Openness: { mean: 3.70, stdDev: 0.65 }
        };
    
        // Step 3: Convert Emotional Stability to Neuroticism (invert scale)
        const neuroticism = 5 - results["Emotional Stability"];
        
        // Step 4: Calculate z-scores
        const zScores = {
            z_E: (results.Extraversion - populationNorms.Extraversion.mean) / populationNorms.Extraversion.stdDev,
            z_N: (neuroticism - populationNorms.Neuroticism.mean) / populationNorms.Neuroticism.stdDev,
            z_A: (results.Agreeableness - populationNorms.Agreeableness.mean) / populationNorms.Agreeableness.stdDev,
            z_C: (results.Conscientiousness - populationNorms.Conscientiousness.mean) / populationNorms.Conscientiousness.stdDev,
            z_O: (results.Openness - populationNorms.Openness.mean) / populationNorms.Openness.stdDev
        };
    
        console.log("Z-scores:", zScores);
    
        // Step 5: GMM cluster centroids
        const clusterCentroids = {
            "Reactive Idealist": [0.035, 0.077, -0.063, -0.231, 0.047],
            "Balanced Realist": [0.047, -0.121, -0.212, 0.113, 0.088],
            "Sensitive Companion": [-0.058, -0.062, 0.091, 0.082, -0.124],
            "Secure Optimist": [0.107, -0.217, 0.081, 0.060, -0.098]
        };
    
        // Step 6: Calculate Euclidean distances and find closest cluster
        const userVector = [zScores.z_E, zScores.z_N, zScores.z_A, zScores.z_C, zScores.z_O];
        
        let closestCluster = null;
        let minDistance = Infinity;
    
        for (const [clusterName, centroid] of Object.entries(clusterCentroids)) {
            // Calculate Euclidean distance
            const distance = Math.sqrt(
                centroid.reduce((sum, centroidValue, index) => {
                    return sum + Math.pow(userVector[index] - centroidValue, 2);
                }, 0)
            );
    
            console.log(`Distance to ${clusterName}:`, distance);
    
            if (distance < minDistance) {
                minDistance = distance;
                closestCluster = clusterName;
            }
        }
    
        // Step 7: Assign personality type
        const personalityType = closestCluster;
        console.log("Assigned personality type:", personalityType);
    
        console.log("Final Results:", results);
    
        // Get the currently authenticated user's ID
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
    
        if (userError || !user) {
            console.error("Error fetching user:", userError.message);
            return;
        }
    
        const userId = user.id;
    
        // Step 8: Insert data into the user_personality_data table
        try {
            const { error: insertError } = await supabase.from("user_personality_data").insert([
                {
                    id: userId,
                    extraversion: results.Extraversion,
                    emotional_stability: results["Emotional Stability"],
                    agreeableness: results.Agreeableness,
                    conscientiousness: results.Conscientiousness,
                    openness: results.Openness,
                    open_ended: results.openEnded,
                    personality_type: personalityType,
                    z_score_extraversion: zScores.z_E,
                    z_score_neuroticism: zScores.z_N,
                    z_score_agreeableness: zScores.z_A,
                    z_score_conscientiousness: zScores.z_C,
                    z_score_openness: zScores.z_O,
                    cluster_distance: minDistance
                },
            ]);
    
            if (insertError) {
                throw insertError;
            }
    
            console.log("Results saved to database successfully!");
        } catch (error) {
            console.error("Error saving results to database:", error.message);
        }
    
        // Pass the personality type to the parent component if needed
        if (setPersonalityResult) {
            setPersonalityResult({
                ...results,
                personalityType,
                zScores,
                clusterDistance: minDistance
            });
        }
    
        navigate("/profile"); // Redirect to profile page
    };

    return (
        <div className="questionnaire-container">
            <h1>Questionnaire</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    calculateResults();
                }}
                className="questionnaire-form">
                {Object.keys(questions).map((trait) => (
                    <div key={trait} className="trait-section">
                        <h3>{trait}</h3>
                        {questions[trait].map((question, index) => (
                            <div key={index} className="form-group">
                                <label>{question}</label>
                                <div className="rating-boxes">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            type="button"
                                            key={value}
                                            className={`rating-box ${
                                                responses[`${trait}-${index}`] === value
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() => handleSelect(trait, index, value)}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <hr className="solid"></hr>
                <div className="form-group">
                    <label>Tell us about your ideal roommate or living preferences:</label>
                    <textarea
                        placeholder="Write your response here..."
                        className="feedback-input"
                        onChange={(e) =>
                            setResponses((prev) => ({ ...prev, openEnded: e.target.value }))
                        }
                    />
                </div>
                <button type="submit" className="questionnaire-submit-btn">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default Questionnaire;