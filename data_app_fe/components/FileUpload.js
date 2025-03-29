// components/FileUpload.js
'use client'
import React, { useState } from 'react';

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState("");

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch('http://localhost:8000/upload/', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setMessage(result.message);
        } catch (error) {
            console.error(error);
            setMessage("Error uploading files");
        }
    };

    return (
        <div>
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default FileUpload;
