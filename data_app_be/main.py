from fastapi import FastAPI, File, UploadFile, Form, HTTPException
import pandas as pd
import os
from typing import List

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store uploaded files
uploaded_files = {}

@app.post("/upload/")
async def upload_files(files: List[UploadFile] = File(...)):
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        uploaded_files[file.filename] = file_path
    return {"message": "Files uploaded successfully", "files": list(uploaded_files.keys())}

@app.get("/files/")
async def list_files():
    return {"files": list(uploaded_files.keys())}

@app.get("/preview/")
async def preview_file(filename: str, rows: int = 5):
    if filename not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = uploaded_files[filename]
    
    try:
        df = pd.read_csv(file_path)

        # Replace NaN and Infinite values with a placeholder (e.g., null)
        df = df.fillna("NULL").replace([float("inf"), float("-inf")], "NULL")

        return {"preview": df.head(rows).to_dict(orient="records")}
    
    except Exception as e:
        print(f"Error: {e}")  # Debugging
        raise HTTPException(status_code=500, detail=str(e))
