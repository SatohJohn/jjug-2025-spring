const { useState, useRef } = React;

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessages([]);
    setLoading(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    // fetchでSSEを受信
    const eventSource = new EventSourcePolyfill("/message", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Accept": "text/event-stream"
      },
      body: input
    });
    eventSourceRef.current = eventSource;
    eventSource.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };
    eventSource.onerror = () => {
      setLoading(false);
      eventSource.close();
    };
    eventSource.onopen = () => {
      setLoading(false);
    };
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Gemini AI チャット</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          style={{ flex: 1, padding: 8 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>送信</button>
      </form>
      <div style={{ marginTop: 24 }}>
        <h2>AIの返答</h2>
        <div style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 16, borderRadius: 8, minHeight: 80 }}>
          {messages.length === 0 && !loading && <span style={{ color: '#aaa' }}>ここにAIの返答が表示されます</span>}
          {messages.map((msg, i) => <div key={i}>{msg}</div>)}
        </div>
        {loading && <div style={{ color: '#888', marginTop: 8 }}>受信中...</div>}
      </div>
    </div>
  );
}

// EventSourcePolyfill: fetch+SSE対応
class EventSourcePolyfill {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.controller = new AbortController();
    this.onmessage = null;
    this.onerror = null;
    this.onopen = null;
    this._connect();
  }
  _connect() {
    fetch(this.url, {
      ...this.options,
      signal: this.controller.signal,
    }).then(async res => {
      if (this.onopen) this.onopen();
      const reader = res.body.getReader();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += new TextDecoder().decode(value);
        let lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.replace(/^data:/, "").trim();
            if (this.onmessage) this.onmessage({ data });
          }
        }
      }
    }).catch(() => {
      if (this.onerror) this.onerror();
    });
  }
  close() {
    this.controller.abort();
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />); 