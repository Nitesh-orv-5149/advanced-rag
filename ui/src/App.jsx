import { useRef, useState } from "react";

const API_URL = "http://localhost:8000";

function UserIcon() {
  return (
    <div className="w-8 h-8 shrink-0 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-200">
      U
    </div>
  );
}

function AiIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-8 h-8 shrink-0 rounded-full bg-neutral-800 border border-neutral-700 p-1.5 text-neutral-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaperclipIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M17.5 8.5l-7 7a3 3 0 004.24 4.24l7-7a5 5 0 00-7.07-7.07l-7 7a7 7 0 009.9 9.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" />
    </div>
  );
}

function Message({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? <UserIcon /> : <AiIcon />}
      <div
        className={`max-w-[75%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-neutral-800 text-neutral-100"
            : "bg-neutral-900 border border-neutral-800 text-neutral-300"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) setAttachedFile(file);
  }

  async function handleQuerySubmit(e) {
    if (e.key !== "Enter" || !queryText.trim()) return;
    const query = queryText.trim();
    const file = attachedFile;
    setQueryText("");
    setAttachedFile(null);

    setMessages((m) => [
      ...m,
      { role: "user", text: file ? `📎 ${file.name}\n${query}` : query },
    ]);
    setBusy(true);

    const formData = new FormData();
    formData.append("query", query);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/chat`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      const sources = data.chunk_numbers.join(", ");
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `${data.answer}\n\nSources: chunks ${sources}` },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: `Error: ${err.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <header className="border-b border-neutral-800 px-4 py-3">
        <h1 className="text-sm font-medium text-neutral-400">Advanced RAG</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {messages.length === 0 && (
          <p className="text-neutral-500 text-sm">Attach a PDF and ask a question about it.</p>
        )}
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} text={msg.text} />
        ))}
        {busy && (
          <div className="flex gap-3">
            <AiIcon />
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              <TypingDots />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-800 px-4 py-3">
        <div className="max-w-2xl w-full mx-auto">
          {attachedFile && (
            <div className="flex items-center gap-2 mb-2 w-fit bg-neutral-900 border border-neutral-800 rounded-md px-2.5 py-1.5 text-xs text-neutral-300">
              <PaperclipIcon className="w-3.5 h-3.5" />
              <span>{attachedFile.name}</span>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-neutral-500 hover:text-neutral-200"
                title="Remove attachment"
              >
                <XIcon />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-2">
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={busy}
              title="Attach PDF"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
            >
              <PaperclipIcon />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFile}
              className="hidden"
            />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={handleQuerySubmit}
              disabled={busy}
              placeholder={attachedFile ? "Ask something about this file…" : "Ask a question about the ingested PDFs…"}
              className="flex-1 bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
