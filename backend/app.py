from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["https://ai-pdf-chatbot-clean-r90pui82b-avdhuts-projects.vercel.app", "*"])  # Added wildcard for dev safety

# Set upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the uploads folder exists (important for Render)
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    print(f"Created upload directory at: {UPLOAD_FOLDER}")

# Global vector database instance
vectordb = None

# Upload PDF route
@app.route('/upload', methods=['POST'])
def upload_file():
    global vectordb
    print("🔁 /upload endpoint called")

    if 'file' not in request.files:
        print("🚫 No file uploaded")
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    print(f"📁 File saved to: {filepath}")

    try:
        loader = PyMuPDFLoader(filepath)
        pages = loader.load_and_split()
        pages = [page for page in pages if page.page_content.strip() != ""]
        if not pages:
            return jsonify({'error': 'PDF contains no readable text.'}), 400
    except Exception as e:
        print(f"❌ Error processing PDF: {e}")
        return jsonify({'error': f'Failed to process PDF: {str(e)}'}), 500

    try:
        embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
        vectordb = Chroma.from_documents(pages, embedding=embeddings)
    except Exception as e:
        print(f"❌ Error generating embeddings: {e}")
        return jsonify({'error': f'Failed to create embeddings: {str(e)}'}), 500

    print("✅ PDF processed and vectorized successfully")
    return jsonify({'message': 'File uploaded and vectorized successfully!'})

# Ask Question route
@app.route('/ask', methods=['POST'])
def ask_question():
    global vectordb
    print("🧠 /ask endpoint called")

    if not vectordb:
        return jsonify({'error': 'No PDF uploaded yet.'}), 400

    data = request.get_json()
    question = data.get("question")

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        llm = ChatOpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"))
        qa = RetrievalQA.from_chain_type(llm=llm, retriever=vectordb.as_retriever())
        answer = qa.invoke({"query": question})["result"]
        print(f"📨 Answered: {answer}")
    except Exception as e:
        print(f"❌ Error generating answer: {e}")
        return jsonify({'error': f'Failed to generate answer: {str(e)}'}), 500

    return jsonify({'answer': answer})

# Health check
@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "AI PDF Chatbot backend is live 🚀"}), 200

# Run the server
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)
