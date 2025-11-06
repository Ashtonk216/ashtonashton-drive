import React, { useState, useRef } from 'react';

function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setError('File too large. Max size is 500MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const token = localStorage.getItem('token');

      const response = await fetch('https://api.ashtonashton.net/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      alert(`File "${data.filename}" uploaded successfully!`);
      setSelectedFile(null);
      fileInputRef.current.value = ''; // reset file input
      onUploadSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h3>Upload File</h3>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: 'none' }} // hide native input
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px', // consistent spacing
          marginBottom: '10px',
        }}
      >
        <label
          onClick={() => fileInputRef.current.click()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          Choose File
        </label>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: selectedFile && !uploading ? '#28a745' : '#ccc',
            color: 'white',
            borderRadius: '5px',
            cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
            border: 'none',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {selectedFile && (
        <p>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default FileUpload;