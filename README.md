Personality-Based Roommate Matching System
Welcome to the Personality-Based Roommate Matching System! This project utilizes personality data based on the Big Five Factor Model to create clusters of similar personalities, which can be used for matching compatible roommates.



Dataset
The dataset (data-final.csv) is provided as part of this repository. The data was collected through an online personality test and includes responses to questions about five personality traits: Extraversion, Agreeableness, Conscientiousness, Emotional Stability, and Openness.

For details on the personality items, refer to the codebook.

Dependencies
This project uses Python and the following libraries:

pandas - For data manipulation
scikit-learn - For clustering algorithms and data scaling
matplotlib - For plotting visualizations
seaborn - For additional visualizations (heatmap)
To install the dependencies, run:

bash
Copy code
pip install -r requirements.txt
Project Structure
data-final.csv: The dataset used for clustering.
cluster_personality.py: Main script to read, preprocess, cluster, and visualize the personality data.
requirements.txt: List of required libraries for easy setup.
README.md: Project documentation.
Usage
Step 1: Preprocess and Cluster the Data
Run the cluster_personality.py script to preprocess, scale, and cluster the data:

bash
Copy code
python cluster_personality.py
This script will:

Load and preprocess the dataset.
Standardize personality scores for clustering.
Use K-Means clustering to group similar personality profiles.
Output the clustered data to a CSV file (clustered_personality_data.csv).
Step 2: Visualize the Clusters
After clustering, the script generates visualizations to understand the cluster structure. The generated visualizations include:

Elbow Plot: Helps determine the optimal number of clusters.
2D PCA Plot: Visualizes clusters in a 2D space using PCA.
2D t-SNE Plot: Provides a clearer view of clusters with t-SNE.
Cluster Centroid Heatmap: Shows the average personality profile for each cluster.
These visualizations will display in your environment, or you can save them directly within the code if desired.

Cluster Visualization
Here's a breakdown of the visualizations:

Elbow Plot: Determines the optimal number of clusters by plotting inertia values for different cluster counts.
PCA and t-SNE Scatter Plots: These plots show the personality data points in 2D space, colored by their cluster assignment.
Cluster Centroid Heatmap: This heatmap shows the average trait scores for each cluster, helping to interpret the dominant personality characteristics within each cluster.
Future Improvements
Real-Time Matching: Implement a system to assign new users to the most compatible cluster based on personality traits.
User Feedback Loop: Collect feedback on roommate compatibility to refine the clustering and matching criteria.
Expand Matching Criteria: Incorporate additional factors such as lifestyle preferences or habits for a more holistic matching system.
Contributing
Contributions are welcome! If you have suggestions for improvements, please create a pull request or open an issue.
