from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from typing import List
from pandasai import SmartDataframe
from pandasai_openai import OpenAI
import pandasai as pai
from dotenv import load_dotenv  # Load environment variables from .env file

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API Key from the environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("❌ Missing OpenAI API Key in .env file!")

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Define upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store uploaded data and dataframes
uploaded_files = {}
dataframes = {}

# Configure OpenAI API key for PandasAI
llm = OpenAI(api_token=OPENAI_API_KEY)  # Now using the API key securely from .env
pai.config.set({"llm": llm})  # Set the LLM config for PandasAI

@app.post("/upload/")
async def upload_files(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No file uploaded")

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        uploaded_files[file.filename] = file_path

        # Load file into Pandas dataframe
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif file.filename.endswith(".xls") or file.filename.endswith(".xlsx"):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        dataframes[file.filename] = df

    return {"message": "Files uploaded successfully", "files": list(uploaded_files.keys())}

@app.get("/files/")
async def list_files():
    return {"files": list(uploaded_files.keys())}

@app.get("/preview/")
async def preview_file(filename: str, rows: int = 5):
    if filename not in dataframes:
        raise HTTPException(status_code=404, detail="File not found")

    df = dataframes[filename]
    
    try:
        # Handle NaN and infinite values
        df = df.fillna("NULL").replace([float("inf"), float("-inf")], "NULL")
        return {"preview": df.head(rows).to_dict(orient="records")}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask/")
async def ask_question(question: str = Form(...), filename: str = Form(...)):
    if filename not in dataframes:
        raise HTTPException(status_code=404, detail="File not found")

    df = dataframes[filename]
    
    try:
        # Use SmartDataframe to interact with PandasAI and OpenAI
        smart_df = SmartDataframe(df)  # Create SmartDataframe with the loaded data
        response = smart_df.chat(question)  # Run the AI query

        return {"answer": response}
    
    except Exception as e:
        print(f"AI Query Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
