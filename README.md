# geospatial-ai-projects


AI-powered GIS workflow using Google Gemini, GeoPandas, Shapely, and Folium.

Ask spatial questions in natural language, let AI select the appropriate GIS tool, perform the actual spatial operation, and visualize the result on an interactive map.

Workflow
Natural Language
      ↓
   Gemini AI
      ↓
   GIS Tool
      ↓
Spatial Result
      ↓
 Map Visualization
GIS Operations
Area calculation
Distance calculation
Buffer creation
Layer intersection
Tech Stack

Python • Gemini API • GeoPandas • Shapely • Folium • Jupyter Notebook

The youtube video for the workflow is https://youtu.be/Qg8hY4qXrUA

--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

Setup & Usage
1. Create Conda Environment

Open Anaconda Prompt or a terminal in VS Code:

conda create -n smart-gis-app python=3.12
conda activate smart-gis-app

2. Open the Project in VS Code
cd smart-gis-app

3. Copy the project folder and subfolders from Video1-ai-gis-tools/smart-app-gis

Select the smart-gis-app environment as the Python/Jupyter kernel in VS Code.

3. Install Dependencies
pip install -r requirements.txt

4. Configure Gemini API Key - Go to https://aistudio.google.com/api-key

Create a .env file in the project root:

GEMINI_API_KEY=your_gemini_api_key

Copy the key in Python: .env file and save it.

5. Run the GIS + AI Workflow
   Open the Jupyter notebook (ai_gis_tools.ipynb) in VS Code

   Example:

Create a 500-meter buffer around ../data/sample_polygon1.geojson

Gemini interprets the request, selects the appropriate GIS tool, and triggers the spatial operation.


