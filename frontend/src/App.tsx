import { useState, KeyboardEvent } from 'react';
import axios from 'axios';

// Singleton explicit Axios instantiator
const api = axios.create({ baseURL: 'http://localhost:3000/api' });

interface Source { documentId: string; distance?: number; }
interface ChatMessage { id: string; sender: 'user' | 'assistant'; text: string; sources?: Source[]; }

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Section 1: Upload Logic natively
  const handleUpload = async () => {
    if (!file) return;
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await api.post('/upload', formData);
      setUploadStatus(`Uploaded successfully. Document ID: ${res.data.documentId} | Chunks Stored: ${res.data.chunksStored}`);
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.response?.data?.error || err.message}`);
    }
  };

  // Section 2: Generation Request sequences
  const handleSend = async () => {
    const query = inputMsg.trim();
    if (!query || isChatLoading) return;

    setInputMsg('');
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await api.post('/chat', { query });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.data.response,
        sources: res.data.sources
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Backend Error: ${err.response?.data?.error || err.message}`
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container">
      <h1>Document Chatbot</h1>
      <hr />

      {/* Upload PDF Section strictly targeting form-data hooks */}
      <div className="section">
        <h2>Upload PDF</h2>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleUpload} disabled={!file || uploadStatus === 'Uploading...'}>Upload</button>
        </div>
        {uploadStatus && <div className="status">{uploadStatus}</div>}
      </div>

      <hr />

      {/* Scrollable Document Chat Logic */}
      <div className="section" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h2>Chat</h2>
        <div className="chat-window">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <strong>{msg.sender === 'user' ? 'You:' : 'Assistant:'}</strong>
              <div className="text">{msg.text}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="sources">
                  <strong>Sources:</strong>
                  {msg.sources.map((s, i) => (
                    <div key={i} className="source-item">
                      {s.documentId} (Distance: {s.distance?.toFixed(4)})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isChatLoading && <div className="thinking">Thinking...</div>}
        </div>

        <div className="input-area">
          <textarea
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isChatLoading}
            placeholder="Type your question..."
          />
          <button onClick={handleSend} disabled={isChatLoading || !inputMsg.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}
