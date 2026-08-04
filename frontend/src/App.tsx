import { useState, type KeyboardEvent, useEffect, useCallback } from 'react';
import axios from 'axios';

const LOCAL_STORAGE_KEY = 'rag_chat_history';

// Singleton explicit Axios instantiator
const api = axios.create({ baseURL: 'http://localhost:3000/api' });

interface Source { documentId: string; distance?: number; }
interface ChatMessage { id: string; sender: 'user' | 'assistant'; text: string; sources?: Source[]; }
interface IndexedDocument { documentId: string; filename: string; timestamp: string; chunkCount: number; }

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false); // Protect against mount overwrites

  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [docFeedback, setDocFeedback] = useState<string>('');
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  // ==========================================
  // PART 1: CHAT PERSISTENCE HYDRATION & SYNC
  // ==========================================

  // Hydrate chat locally via DOM memory strictly at app startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Failed to parse chat history from localStorage", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync new conversation streams dynamically ensuring we never wipe loaded state natively
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, isHydrated]);

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // ==========================================
  // PART 3: DOCUMENT MANAGEMENT
  // ==========================================

  const fetchDocuments = useCallback(async () => {
    setIsDocsLoading(true);
    setDocFeedback('');
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err: any) {
      setDocFeedback(`Failed to fetch documents: ${err.message}`);
    } finally {
      setIsDocsLoading(false);
    }
  }, []);

  // Load documents strictly once exactly upon UI mount mapping API dependencies
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDeleteDocument = async (id: string) => {
    setDocFeedback(`Deleting document ${id}...`);
    try {
      await api.delete(`/documents/${id}`);
      setDocFeedback(`Successfully purged document ${id} from Vector index.`);
      fetchDocuments(); // Refresh bounds internally isolating state cleanly 
    } catch (err: any) {
      setDocFeedback(`Delete failed: ${err.response?.data?.error || err.message}`);
    }
  };

  // ==========================================
  // UPLOAD WORKFLOW
  // ==========================================
  const handleUpload = async () => {
    if (!file) return;

    // Disable inputs while working improving UX drastically 
    setUploadStatus('Uploading...');
    const formData = new FormData();

    // Explicitly bound parameter matching Multer constraints perfectly
    formData.append('document', file);

    try {
      const res = await api.post('/upload', formData);
      setUploadStatus(`Uploaded successfully: ${res.data.chunksStored} vectors stored.`);
      setFile(null);
      fetchDocuments(); // Always refresh documents strictly tracking dependencies implicitly
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.response?.data?.error || err.message}`);
    }
  };

  // ==========================================
  // CHAT WORKFLOW
  // ==========================================
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
        <h2>Knowledge Base Management</h2>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
          {/* Prevent upload while it's currently uploading solving UX issues safely */}
          <button onClick={handleUpload} disabled={!file || uploadStatus === 'Uploading...'}>Upload</button>
        </div>
        {uploadStatus && <div className="status">{uploadStatus}</div>}

        {/* Document Listing Arrays mapped directly under bounds strictly extracting logic */}
        <div className="doc-list">
          <h4>Indexed Documents ({documents.length})</h4>
          {docFeedback && <div className="status doc-feedback">{docFeedback}</div>}

          {isDocsLoading && documents.length === 0 ? (
            <p>Loading documents...</p>
          ) : documents.map((doc, i) => (
            <div key={i} className="doc-card">
              <div className="doc-card-info">
                <h4>{doc.filename}</h4>
                <p>ID: {doc.documentId}</p>
                <p>Uploaded: {new Date(doc.timestamp).toLocaleString()} | Vectors: {doc.chunkCount}</p>
              </div>
              <button
                className="btn-delete"
                onClick={() => handleDeleteDocument(doc.documentId)}
                disabled={docFeedback.includes('Deleting')}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr />

      {/* Scrollable Document Chat Logic */}
      <div className="section" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Chat</h2>
          <button
            onClick={handleClearChat}
            style={{ backgroundColor: '#dc3545', padding: '6px 12px', fontSize: '0.85em' }}>
            Clear Chat
          </button>
        </div>
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
          { /* Loading indication bound robustly without third parties */}
          {isChatLoading && <div className="thinking">Thinking...</div>}
        </div>

        <div className="input-area">
          <textarea
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isChatLoading}
            placeholder={isChatLoading ? "Wait for response..." : "Type your question..."}
          />
          { /* Button disabled sequentially preventing dual-firing */}
          <button onClick={handleSend} disabled={isChatLoading || !inputMsg.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}
