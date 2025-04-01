# AI-Powered Data Analysis App

## Overview
This project is an AI-powered web application that allows users to:
- Upload **CSV/XLS** files
- View the **top N rows** of the dataset
- Ask **AI-powered questions** about the uploaded data

The backend is built with **FastAPI**, and the frontend is developed using **Next.js** using **ShadCN UI components**.

---

## Tech Stack
### **Frontend**:
- Next.js (React-based frontend framework)
- ShadCN (UI components)

### **Backend**:
- FastAPI (Python backend framework)
- Pandas & PandasAI (Data processing & AI-powered analysis)

### **How to Use the App**:
- Upload a File
- Click the "Choose File" button to select a CSV or Excel file.
- Click "Upload" to send the file to the backend.

### **Preview Data**:
- Enter the number of rows you want to preview.
- Click "Show Top Rows" to display the selected number of rows.

### **Ask AI-Powered Questions**:
- Type a question related to the uploaded dataset (e.g., "What is the average salary?").
- Click "Get Answer" to receive an AI-generated response.
- AI responses will be stored in Prompt History for reuse.