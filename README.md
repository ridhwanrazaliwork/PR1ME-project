# AI Contract Assistant Backend API

This documentation outlines the available backend API routes for the **AI Contract Assistant** system. Each route handles specific functionality like uploading contracts, querying them, and summarizing legal documents.

## To install python module
Ensure python = 3.11.9
pip install -r requirements.txt

## Flow Overview
- **Step 1**: Upload Document
The user uploads a document (PDF or image) to the system.
OCR (Optical Character Recognition) is performed on the document.
The extracted content is saved to contracts.json.
- **Step 2**: Pick Summarize or Query
Summarize: The system will provide a summary of the contract.
Query: The system will answer specific questions based on the contents of the document.

### Base URL: `/`

## 1. Upload Document

- **Endpoint:** `/upload`
- **Method:** `POST`
- **Description:** Upload a document (PDF or image) to perform OCR and store the content.
- **Request:**
  - Form-data with the key `file` containing the file to be uploaded (PDF, PNG, JPG).
- **Response:**
  - Success: `{ "success": True, "documentId": "", "filename": "" }`
  - Error: `{ "success": False, "error": "" }`

## 2. Summarize Document

- **Endpoint:** `/summarize`
- **Method:** `POST`
- **Description:** Summarize the contents of an uploaded document.
- **Request:**
  - JSON body with the following field:
    - `documentId` (string): The unique ID of the document to be summarized.
- **Response:**
  - Success: `{ "summary": "" }`
  - Error: `{ "error": "" }`

## 3. Query Contract

- **Endpoint:** `/query`
- **Method:** `POST`
- **Description:** Ask a question about an uploaded contract, and the AI will provide an answer based on the document's contents.
- **Request:**
  - JSON body with the following fields:
    - `documentId` (string): The unique ID of the document.
    - `query` (string): The question to ask about the contract.
- **Response:**
  - Success: `{ "response": "" }`
  - Error: `{ "error": "" }`

## 4. Home

- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** Basic home route to check if the server is running.
- **Response:** Plaintext "Hello, World!"

---

### Notes:
- All responses will be in JSON format.
- Ensure that the `LLM_API_KEY` is set in the /backend/.env to connect with the Groq service for document summaries and queries.
