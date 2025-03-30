"use client";
import { useState } from "react";

const Home = () => {
    const [file, setFile] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [nRows, setNRows] = useState(5);
    const [data, setData] = useState([]);

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

            const result = await response.json();
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

    return (
        <div>
            <h1>AI-powered Data Application</h1>

            {/* File Upload */}
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload File</button>

            {/* Input for number of rows */}
            <input
                type="number"
                value={nRows}
                onChange={(e) => setNRows(e.target.value)}
                min="1"
            />
            <button onClick={fetchTopRows}>Show Top Rows</button>

            {/* Display Data */}
            {data.length > 0 && (
                <table border="1">
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
            )}
        </div>
    );
};

export default Home;
