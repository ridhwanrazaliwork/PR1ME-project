import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Select, MenuItem, InputLabel, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const AIContractInterface = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false); // Typing status for response
  const [isSummaryTypingDone, setIsSummaryTypingDone] = useState(false); // Typing status for summary

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('File uploaded and processed successfully!');
        setUploadedDocuments((prevDocs) => [...prevDocs, data.documentId]);
        setSelectedDocument(data.documentId);
      } else {
        alert('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }

    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: selectedDocument, query }),
      });
      const data = await res.json();
      setResponse(data.response);
      setIsTypingDone(false); // Reset typing status when new response comes in
    } catch (error) {
      console.error('Error fetching data:', error);
      setResponse('Error fetching response');
    }
  };

  const handleSummarize = async () => {
    if (!selectedDocument) {
      alert('Please select a document first.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: selectedDocument }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setIsSummaryTypingDone(false); // Reset typing status when a new summary is fetched
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary('Error fetching summary');
    }
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        AI Contract Assistant
      </Typography>

      <Box sx={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept="application/pdf, image/*"
          onChange={handleFileChange}
          style={{ marginRight: '10px' }}
        />
        <Button variant="contained" color="primary" onClick={handleFileUpload} disabled={isUploading}>
          {isUploading ? <CircularProgress size={24} /> : 'Upload and Process'}
        </Button>
      </Box>

      <Box sx={{ marginBottom: '20px' }}>
        <InputLabel id="select-document-label">Select a document...</InputLabel>
        <Select
          labelId="select-document-label"
          value={selectedDocument}
          onChange={(e) => setSelectedDocument(e.target.value)}
          fullWidth
          sx={{ marginBottom: '20px' }}
        >
          <MenuItem value=""><em>Select a document</em></MenuItem>
          {uploadedDocuments.map((docId, index) => (
            <MenuItem key={index} value={docId}>
              {`Contract ${index + 1} (${docId})`}
            </MenuItem>
          ))}
        </Select>
        <Button variant="outlined" onClick={handleSummarize}>Summarize</Button>
      </Box>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Ask about your contracts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ marginBottom: '20px' }}
        />
        <Button type="submit" variant="contained" color="secondary">Send</Button>
      </form>
      
      {summary && (
        <Box sx={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <Typography variant="h6">Document Summary:</Typography>
          <ReactMarkdown>{summary}</ReactMarkdown> 
        </Box>
      )}

      {response && (
        <Box sx={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
          <Typography variant="h6">AI Response:</Typography>
          <ReactMarkdown>{response}</ReactMarkdown> 
        </Box>
      )}
    </Box>
  );
};

export default AIContractInterface;
