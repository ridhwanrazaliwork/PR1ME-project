import os
import json
import easyocr
import uuid
import fitz  # PyMuPDF
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv


# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app)
contracts = {}  # Define this at the top level, globally

# Set up Groq client
groq_client = Groq(api_key=os.getenv('LLM_API_KEY'))

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400

    # Ensure the 'uploads' folder exists
    upload_folder = 'uploads'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Save the uploaded file
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    # Generate a unique documentId for the uploaded file
    document_id = str(uuid.uuid4())  # Generate a unique ID for the document
    file_name = file.filename  # The original file name

    # Perform OCR based on file type
    reader = easyocr.Reader(['en'])  # Initialize EasyOCR reader
    contracts = {}

    if file.filename.endswith('.pdf'):
        # Extract images from PDF
        pdf_document = fitz.open(file_path)
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            pix = page.get_pixmap()  # Render page to an image
            image_path = f'uploads/page_{page_num + 1}.png'
            pix.save(image_path)

            # Perform OCR on the extracted image
            ocr_result = reader.readtext(image_path)
            contracts[f'page_{page_num + 1}'] = " ".join([text[1] for text in ocr_result])
    else:
        # Perform OCR directly on image file
        ocr_result = reader.readtext(file_path)
        contracts[file.filename] = " ".join([text[1] for text in ocr_result])

# Save contracts to JSON file
    try:
        # Try to read existing contracts
        with open('contracts.json', 'r') as json_file:
            existing_data = json.load(json_file)
    except (FileNotFoundError, json.JSONDecodeError):
        # Create a new dictionary if the file doesn't exist or is empty
        existing_data = {}

    # Update existing data with new contract information
    existing_data[document_id] = {
        "filename": file_name,
        "content": contracts  # Store the OCR results
    }

    # Write back the updated data
    with open('contracts.json', 'w') as json_file:
        json.dump(existing_data, json_file, indent=4)


    return jsonify({"success": True, "documentId": document_id, "filename": file_name})

@app.route('/')
def home():
    return "Hello, World!"

@app.route('/summarize', methods=['POST'])
def summarize_document():
    data = request.json
    document_id = data.get('documentId')

    # Load the contracts from the JSON file
    with open('contracts.json', 'r') as json_file:
        contracts = json.load(json_file)
    
    if document_id not in contracts:
        return jsonify({"error": "Document not found"}), 404
    
    content = contracts[document_id]
    
    try:
        response = groq_client.chat.completions.create(
            model="llama3-70b-8192",  # or another appropriate Groq model
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes legal contracts. Output the answer in markdown format."},
                {"role": "user", "content": f"Please summarize the following contract into markdown format:\n\n{content}"}
            ]
        )
        summary = response.choices[0].message.content
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/query', methods=['POST'])
def query_contract():
    data = request.json
    document_id = data.get('documentId')
    query = data.get('query')

    # Load the contracts from the JSON file
    with open('contracts.json', 'r') as json_file:
        contracts = json.load(json_file)
    
    if document_id not in contracts:
        return jsonify({"error": "Document not found"}), 404
    
    content = contracts[document_id]
    
    try:
        response = groq_client.chat.completions.create(
            model="llama3-70b-8192",  # or another appropriate Groq model
            messages=[
                {"role": "system", "content": "You are a helpful assistant that answers questions about legal contracts. Output the answer in markdown format."},
                {"role": "user", "content": f"Based on the following contract:\n\n{content}\n\nAnswer this question: {query}"}
            ]
        )
        answer = response.choices[0].message.content
        return jsonify({"response": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)