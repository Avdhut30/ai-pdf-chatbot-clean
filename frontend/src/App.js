import React, { useState } from 'react';
import './App.css';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://ai-pdf-chatbot-clean-api.onrender.com"; // ✅ no trailing slash

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
    setStatus('');
    setAnswer('');
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert("Please select a PDF first.");
      return;
    }

    setLoading(true);
    setStatus("Uploading PDF...");

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      console.log("Upload Response:", data);

      if (res.ok) {
        setStatus("✅ PDF uploaded and vectorized successfully!");
      } else {
        setStatus(`❌ Upload error: ${data.error}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus("❌ Upload failed. Check browser console.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question) {
      alert("Please type a question.");
      return;
    }

    setLoading(true);
    setStatus("Thinking...");

    try {
      const res = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      console.log("Answer Response:", data);

      if (res.ok) {
        setAnswer(data.answer);
        setStatus("✅ Answer received.");
      } else {
        setAnswer('');
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setStatus("❌ Failed to get answer. Check console.");
    } finally {
      setLoading(false);
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
            disabled={loading}
          >
            {loading ? "Uploading..." : "📤 Upload PDF"}
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
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
              disabled={loading}
            >
              {loading ? "Thinking..." : "💬 Ask Question"}
            </button>
          </div>

          {status && (
            <p className="text-sm text-center font-medium text-gray-800">{status}</p>
          )}
        </div>

        {answer && (
          <div className="answer-box mt-6">
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
