import ReactMarkdown from 'react-markdown';
import { useState, type KeyboardEvent, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ChatOrchestrator, type OrchestratedResponse } from './services/agent.service';

const LOCAL_STORAGE_KEY = 'rag_chat_history';

// Singleton explicit Axios instantiator
const api = axios.create({ baseURL: 'http://localhost:3000/api' });

interface Source { documentId: string; distance?: number; }
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: Source[];
  isError?: boolean;
  orchestrationTarget?: OrchestratedResponse['metadata'];
  orchestrated?: boolean;
}
interface IndexedDocument { documentId: string; filename: string; timestamp: string; chunkCount: number; }

const formatFilename = (name: string) => name.replace(/^\d+-\d+-/, '');

const LoadingDots = ({ text }: { text: string }) => (
  <div className="loading-container" aria-live="polite">
    <span className="loading-text">{text}</span>
    <div className="loading-dots" aria-hidden="true">
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
  </div>
);

const MessageSources = ({ sources, documents }: { sources: Source[], documents: IndexedDocument[] }) => {
  const [expanded, setExpanded] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-wrapper">
      <button className="sources-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? '▾' : '▸'} Sources ({sources.length})
      </button>
      {expanded && (
        <div className="sources-list">
          {sources.map((s, i) => {
            const doc = documents.find(d => d.documentId === s.documentId);
            return (
              <div key={i} className="source-item" title={`ID: ${s.documentId}`}>
                <div className="source-title">▸ {doc ? formatFilename(doc.filename) : s.documentId}</div>
                {s.distance !== undefined && <div className="source-distance">Distance: {s.distance.toFixed(4)}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadFeedback, setUploadFeedback] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('rag_theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('rag_theme', theme);
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }, [theme]);

  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading]);

  // ==========================================
  // PART 1: CHAT PERSISTENCE HYDRATION & SYNC
  // ==========================================

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
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
      setSelectedDocumentId((prevId) => {
        if (!prevId) return prevId;
        const currentlyExists = res.data.some((d: IndexedDocument) => d.documentId === prevId);
        return currentlyExists ? prevId : null;
      });
    } catch (err: any) {
      console.error(`Failed to fetch documents: ${err.message}`);
    } finally {
      setIsDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDeleteDocument = async (id: string) => {
    setDeletingId(id);
    try {
      if (id === selectedDocumentId) {
        setSelectedDocumentId(null);
      }
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err: any) {
      console.error(`Delete failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // UPLOAD WORKFLOW
  // ==========================================
  const executeUpload = async (fileToUpload: File) => {
    setUploadStatus('uploading');
    setUploadFeedback('Uploading document');

    const formData = new FormData();
    formData.append('document', fileToUpload);

    try {
      setUploadStatus('processing');
      setUploadFeedback('Processing document');
      await api.post('/upload', formData);
      setUploadStatus('success');
      setUploadFeedback('✓ Document uploaded');
      fetchDocuments();
      setTimeout(() => setUploadStatus('idle'), 3000); // Reset UI automatically elegantly explicitly mapping arrays.
    } catch (err: any) {
      setUploadStatus('error');
      setUploadFeedback('✕ Upload failed');
      setTimeout(() => setUploadStatus('idle'), 4000);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) executeUpload(selected);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === 'application/pdf') {
      executeUpload(dropped);
    }
  };

  // ==========================================
  // CHAT WORKFLOW
  // ==========================================
  const handleSend = async (forcedQuery?: string) => {
    const query = (forcedQuery || inputMsg).trim();
    if (!query || isChatLoading) return;

    setInputMsg('');
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      // The backend accepts selectedDocumentId safely mapping filters inherently explicitly elegantly 
      const res = await ChatOrchestrator.chat(query, selectedDocumentId);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response,
        sources: res.sources,
        orchestrated: res.orchestrated,
        orchestrationTarget: res.metadata
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      // Clean UI error mapping explicitly avoiding dumping raw error objects globally natively gracefully 
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Sorry, I couldn't process that request. Please try again.`,
        isError: true
      }]);
      console.error(err.response?.data?.error || err.message);
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

  // Compute selected UI text natively specifically explicitly 
  const selectedDocName = selectedDocumentId ? documents.find(d => d.documentId === selectedDocumentId)?.filename : null;
  const displaySelectedName = selectedDocName ? formatFilename(selectedDocName) : null;

  return (
    <div className="app-container">
      {/* Sidebar: Knowledge Base */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Knowledge Base</h2>
        </div>

        <div className="upload-section"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => uploadStatus === 'idle' && fileInputRef.current?.click()}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
          />
          {uploadStatus === 'idle' && (
            <div className="upload-prompt">
              <span className="upload-icon">📄</span>
              <span className="upload-title">Upload a PDF</span>
              <span className="upload-subtitle">Drag & drop or choose a file</span>
            </div>
          )}
          {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
            <LoadingDots text={uploadFeedback} />
          )}
          {(uploadStatus === 'success' || uploadStatus === 'error') && (
            <div className={`upload-prompt ${uploadStatus}`}>{uploadFeedback}</div>
          )}
        </div>

        <div className="documents-section">
          <h3 className="section-title">Indexed Documents {documents.length > 0 && `(${documents.length})`}</h3>

          {isDocsLoading && documents.length === 0 ? (
            <div style={{ padding: '0 20px' }}>
              <LoadingDots text="Loading documents" />
            </div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              None found. Please upload a PDF to get started.
            </div>
          ) : (
            <div className="doc-list">
              {/* "All Documents" native option natively natively gracefully gracefully */}
              {documents.length > 0 && (
                <div
                  className={`doc-item ${!selectedDocumentId ? 'selected' : ''}`}
                  onClick={() => setSelectedDocumentId(null)}
                >
                  <div className="doc-item-left">
                    <div className="doc-item-check">{!selectedDocumentId && '✓'}</div>
                    <div className="doc-item-title">All Documents</div>
                  </div>
                </div>
              )}

              {documents.map((doc) => (
                <div
                  key={doc.documentId}
                  className={`doc-item ${selectedDocumentId === doc.documentId ? 'selected' : ''}`}
                  onClick={() => setSelectedDocumentId(doc.documentId)}
                >
                  <div className="doc-item-left">
                    <div className="doc-item-check">{selectedDocumentId === doc.documentId && '✓'}</div>
                    <div className="doc-item-info">
                      <div className="doc-item-title" title={formatFilename(doc.filename)}>{formatFilename(doc.filename)}</div>
                      <div className="doc-item-meta">{doc.chunkCount} chunks</div>
                    </div>
                  </div>
                  <button
                    className="icon-btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this document?')) {
                        handleDeleteDocument(doc.documentId);
                      }
                    }}
                    disabled={deletingId === doc.documentId}
                    aria-label="Delete document"
                    title="Delete document"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area explicitly structurally isolated */}
      <main className="main-chat">
        <header className="chat-header">
          <div className="chat-header-titles">
            <h2>RAG Chatbot</h2>
            {/* <div className="chat-subtitle">Ask questions about your indexed documents</div> */}
          </div>
          <div className="chat-header-actions">
            <button
              className="btn-theme-toggle"
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>
            {displaySelectedName && (
              <div className="retrieval-scope">
                Searching in: {displaySelectedName}
              </div>
            )}
            <button className="btn-clear" onClick={handleClearChat} disabled={messages.length === 0}>
              Clear chat
            </button>
          </div>
        </header>

        <section className="chat-messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h3>Document Assistant</h3>
              <p>Ask questions about your documents.</p>
              {/* <div className="suggestions">
                <span>Try:</span>
                <button className="suggestion-btn" onClick={() => handleSend("What is Redux?")}>"What is Redux?"</button>
                <button className="suggestion-btn" onClick={() => handleSend("Explain middleware")}>"Explain middleware"</button>
                <button className="suggestion-btn" onClick={() => handleSend("What is Express?")}>"What is Express?"</button>
              </div> */}
            </div>
          ) : (
            <div className="chat-thread">
              {messages.map(msg => (
                <div key={msg.id} className={`message-row ${msg.sender}`}>
                  <div className="message-bubble">
                    {msg.sender === 'assistant' ? (
                      <div className="message-content markdown-content">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="message-content">{msg.text}</div>
                    )}

                    {msg.sender === 'assistant' && msg.orchestrated && msg.orchestrationTarget && (
                      <div style={{ marginTop: '12px', padding: '8px', background: 'var(--suggestion-bg)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', gap: '5px', alignItems: 'center', color: 'var(--text-main)' }}>
                          <span style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
                          LangGraph Orchestrated
                        </div>
                        <div>Query Type: {msg.orchestrationTarget.queryType}</div>
                        <div>Routing: {msg.orchestrationTarget.retrievalStrategy}</div>
                        <div>Confidence: {(msg.orchestrationTarget.confidence * 100).toFixed(0)}%</div>
                        <div>Path: {msg.orchestrationTarget.nodePath.join(' ➔ ')}</div>
                      </div>
                    )}

                    {msg.sender === 'assistant' && msg.orchestrated === false && !msg.isError && (
                      <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <span style={{ width: 8, height: 8, background: '#ff991f', borderRadius: '50%', display: 'inline-block' }}></span>
                        Direct Express Resolution
                      </div>
                    )}

                    {msg.sender === 'assistant' && msg.sources && (
                      <MessageSources sources={msg.sources} documents={documents} />
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="message-row assistant">
                  <div className="message-bubble loading-bubble">
                    <LoadingDots text="Assistant is thinking" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        <footer className="chat-input-area">
          <div className="input-wrapper">
            <button
              className="btn-upload"
              title="Attach file"
              onClick={() => uploadStatus === 'idle' && fileInputRef.current?.click()}
              disabled={uploadStatus !== 'idle'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <textarea
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isChatLoading}
              placeholder="Type your question..."
              rows={1}
            />
            <button
              className="btn-send"
              onClick={() => handleSend()}
              disabled={isChatLoading || !inputMsg.trim()}
              title="Send message"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className="input-footer">
            AI can make mistakes. Always check sources.
          </div>
        </footer>
      </main>
    </div>
  );
}
