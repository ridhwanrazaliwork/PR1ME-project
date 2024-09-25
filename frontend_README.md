## Code Overview

The **AIContractInterface** is a React component designed as an AI-powered contract assistant. It lets users upload documents (e.g., PDFs), select a document to query or summarize, and get responses from an AI backend. The design includes various UI elements from Material-UI (MUI) like `TextField`, `Button`, and `Select` for a user-friendly interface.

### Key Features:

#### File Upload:
- Allows users to upload a document, with feedback indicating the upload status via a loading spinner (`CircularProgress`) when the file is being processed.
- After uploading, the document gets added to a selectable list for further actions.

#### Query Input:
- A text input where users can type a query related to the selected document. The query is then sent to the AI for processing.

#### Document Summary:
- Once a document is uploaded and selected, users can request a summary. The summary is displayed in a formatted box.

#### AI Responses:
- Users can send queries to the AI about a document and receive responses, which are displayed below the query form. Both summaries and AI responses use `ReactMarkdown` to render the returned text.

### State Management:
- Uses React hooks (`useState`) to manage local states for file uploads, queries, responses, selected documents, and loading states.
