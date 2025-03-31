"use client";
import { useState } from "react";
import "./home.css"; // Add a CSS file for styling

const Home = () => {
    const [file, setFile] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [nRows, setNRows] = useState(5);
    const [data, setData] = useState([]);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [history, setHistory] = useState([]);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("files", file);
        try {
            const response = await fetch("http://127.0.0.1:8000/upload/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("File upload failed");

            setUploadedFileName(file.name);
            alert("File uploaded successfully!");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const fetchTopRows = async () => {
        if (!uploadedFileName) {
            alert("No file uploaded yet!");
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/preview/?filename=${uploadedFileName}&rows=${nRows}`
            );

            if (!response.ok) throw new Error("Failed to fetch data");

            const result = await response.json();
            setData(result.preview);
        } catch (error) {
            console.error("Error fetching rows:", error);
        }
    };

    const askQuestion = async () => {
        if (!question.trim() || !uploadedFileName) {
            alert("Please enter a question and upload a file first.");
            return;
        }
    
        try {
            const response = await fetch("http://127.0.0.1:8000/ask/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    question: encodeURIComponent(question.trim()),
                    filename: uploadedFileName,
                }),
            });
    
            if (!response.ok) throw new Error("AI request failed");
    
            const result = await response.json();
            
            if (result && typeof result.answer === "object" && "value" in result.answer) {
                setAnswer(result.answer.value);
            } else {
                setAnswer(result.answer || "No answer found.");
            }

            setHistory((prev) => [...new Set([question, ...prev])]);
        } catch (error) {
            console.error("Error asking question:", error);
            setAnswer("Error fetching the answer.");
        }
    };
    
    return (
        <div className="container">
            <h1>AI-powered Data Application</h1>
            
            <div className="section">
                <label className="file-label">Choose File:</label>
                <label className="btn file-btn">
                    Choose File
                    <input type="file" onChange={handleFileChange} className="file-input" />
                </label>
                <button onClick={handleUpload} className="btn">Upload</button>
            </div>

            <div className="section">
                <label>Number of Rows:</label>
                <input 
                    type="number" 
                    value={nRows} 
                    onChange={(e) => setNRows(e.target.value)} 
                    min="1" 
                    className="input visible-input"
                />
                <button onClick={fetchTopRows} className="btn">Show Top Rows</button>
            </div>

            {data.length > 0 && (
                <div className="table-container">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                {Object.keys(data[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, idx) => (
                                        <td key={idx}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="section">
                <label className="question-label">Ask a Question:</label>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question"
                    className="input visible-input"
                />
                <button onClick={askQuestion} className="btn">Get Answer</button>
            </div>

            {answer && (
                <div className="answer-container">
                    <h3>AI Answer:</h3>
                    <p>{answer}</p>
                </div>
            )}

            <div className="history-container">
                <h3>Prompt History</h3>
                {history.length > 0 ? (
                    <ul>
                        {history.map((prompt, index) => (
                            <li key={index} onClick={() => setQuestion(prompt)} className="history-item">
                                {prompt}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No previous prompts</p>
                )}
            </div>
        </div>
    );
};

export default Home;