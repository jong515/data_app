"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import "./home.css";

const Home = () => {
    const [file, setFile] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [nRows, setNRows] = useState(5);
    const [data, setData] = useState([]);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
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
        setLoading(false);
    };

    return (
        <div className="container">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">AI-powered Data Application</h1>
            
            <div className="section">
                <Button onClick={() => document.getElementById("fileInput").click()} className="mb-2">Choose File</Button>
                <input id="fileInput" type="file" onChange={handleFileChange} className="hidden" />
                <div style={{ marginTop: "10px" }}></div>
                <Button onClick={handleUpload} className="mt-2">Upload</Button>
            </div>

            <div className="section">
                <label className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">Number of Rows:</label>
                <Input 
                    type="number" 
                    value={nRows} 
                    onChange={(e) => setNRows(e.target.value)} 
                    min="1" 
                    className="mb-2"
                />
                <Button onClick={fetchTopRows} className="mt-2">Show Top Rows</Button>
            </div>

            {data.length > 0 && (
                <div className="full-table-container" style={{ display: 'flex', justifyContent: 'center' }}>
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
                <label className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">Ask a Question:</label>
                <Input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question"
                    className="mb-2"
                />
                <Button onClick={askQuestion} className="mt-2">Get Answer</Button>
                {loading && <Progress value={50} className="mt-2" />} 
            </div>

            {answer && (
                <div className="answer-container">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">AI Answer:</h3>
                    <p>{answer}</p>
                </div>
            )}

            <div className="history-container" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Prompt History:</h3>
                {history.length > 0 ? (
                    <Select onValueChange={setQuestion} className="mt-2">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a previous prompt" />
                        </SelectTrigger>
                        <SelectContent>
                            {history.map((prompt, index) => (
                                <SelectItem key={index} value={prompt}>{prompt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <p>No previous prompts</p>
                )}
            </div>
        </div>
    );
};

export default Home;
