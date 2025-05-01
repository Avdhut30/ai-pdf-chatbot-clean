import React, { useState } from 'react';
import './App.css';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert("Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleAsk = async () => {
    if (!question) {
      alert("Please type a question.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  return (
    <div className="App min-h-screen flex items-center justify-center p-6">
      <div className="card-animate w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl px-8 py-10 space-y-8">
        <h1 className="text-4xl font-bold text-center text-indigo-700 tracking-tight">
          📄 AI PDF Chatbot
        </h1>

        <div className="space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />

          <button
            onClick={handleUpload}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow-md"
          >
            📤 Upload PDF
          </button>

          {pdfFile && (
            <p className="text-center text-sm text-gray-600 font-medium">
              📁 Selected File: <span className="text-indigo-800">{pdfFile.name}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ask something about the PDF..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={handleAsk}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
            >
              💬 Ask Question
            </button>
          </div>
        </div>

        {answer && (
          <div className="answer-box">
            <h3 className="text-xl font-semibold text-indigo-700 mb-2 text-center">
              🧠 AI Answer
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed text-center">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
