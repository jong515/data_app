"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import "./home.css";

const Home = () => {
    const [file, setFile] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [nRows, setNRows] = useState(5);
    const [data, setData] = useState([]);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [history, setHistory] = useState([]);

    const handleFileChange = (event) => setFile(event.target.files[0]);

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first.");
        const formData = new FormData();
        formData.append("files", file);
        try {
            const response = await fetch("http://127.0.0.1:8000/upload/", { method: "POST", body: formData });
            if (!response.ok) throw new Error("File upload failed");
            setUploadedFileName(file.name);
            alert("File uploaded successfully!");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const fetchTopRows = async () => {
        if (!uploadedFileName) return alert("No file uploaded yet!");
        try {
            const response = await fetch(`http://127.0.0.1:8000/preview/?filename=${uploadedFileName}&rows=${nRows}`);
            if (!response.ok) throw new Error("Failed to fetch data");
            const result = await response.json();
            setData(result.preview);
        } catch (error) {
            console.error("Error fetching rows:", error);
        }
    };

    const askQuestion = async () => {
        if (!question.trim() || !uploadedFileName) return alert("Please enter a question and upload a file first.");
        try {
            const response = await fetch("http://127.0.0.1:8000/ask/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ question: encodeURIComponent(question.trim()), filename: uploadedFileName }),
            });
            if (!response.ok) throw new Error("AI request failed");
            const result = await response.json();
            setAnswer(result.answer?.value || result.answer || "No answer found.");
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
                <Input type="file" onChange={handleFileChange} />
                <Button onClick={handleUpload}>Upload</Button>
            </div>
            <div className="section">
                <Input type="number" value={nRows} onChange={(e) => setNRows(e.target.value)} min="1" />
                <Button onClick={fetchTopRows}>Show Top Rows</Button>
            </div>
            {data.length > 0 && (
                <div className="table-container">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {Object.keys(data[0]).map((key) => <TableHead key={key}>{key}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, index) => (
                                <TableRow key={index}>
                                    {Object.values(row).map((value, idx) => <TableCell key={idx}>{value}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            <div className="section">
                <Input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter your question" />
                <Button onClick={askQuestion}>Get Answer</Button>
            </div>
            {answer && <div className="answer-container"><h3>AI Answer:</h3><p>{answer}</p></div>}
            <div className="history-container">
                <h3>Prompt History</h3>
                {history.length > 0 ? (
                    <ul>{history.map((prompt, index) => <li key={index} onClick={() => setQuestion(prompt)} className="history-item">{prompt}</li>)}</ul>
                ) : (
                    <p>No previous prompts</p>
                )}
            </div>
        </div>
    );
};

export default Home;
