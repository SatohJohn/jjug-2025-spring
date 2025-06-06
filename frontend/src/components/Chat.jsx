import { useState, useEffect, useRef } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat');
      if (!response.ok) {
        throw new Error('メッセージの取得に失敗しました');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('メッセージの取得に失敗しました:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsLoading(true);

    // まずユーザーのメッセージを右側に追加
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: newMessage,
        senderType: 'USER',
      },
    ]);

    // SSEでAI返答をストリーム受信
    const eventSource = new window.EventSource(`/api/chat/stream?content=${encodeURIComponent(newMessage)}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      setMessages((prev) => {
        // すでにAIメッセージが仮で追加されていれば、そのcontentに追記
        const last = prev[prev.length - 1];
        if (last && last.senderType === 'AI') {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + event.data },
          ];
        } else {
          return [
            ...prev,
            {
              id: Date.now() + 1,
              content: event.data,
              senderType: 'AI',
            },
          ];
        }
      });
    };
    eventSource.onerror = () => {
      setIsLoading(false);
      eventSource.close();
    };
    eventSource.onopen = () => {
      // 何もしない
    };

    setNewMessage('');
  };

  const handleReset = async () => {
    if (isLoading) return;
    try {
      const response = await fetch('/api/chat/reset', { method: 'POST' });
      if (!response.ok) {
        throw new Error('リセットに失敗しました');
      }
      setMessages([]);
    } catch (error) {
      alert('リセットに失敗しました');
    }
  };

  return (
    <div className="w-full px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">チャット</h1>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              disabled={isLoading}
            >
              チャット履歴リセット
            </button>
          </div>
          <div className="mb-8 h-[60vh] overflow-y-auto flex flex-col gap-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.senderType === 'USER'
                    ? 'self-end bg-blue-100 text-blue-900 rounded-lg px-4 py-2 max-w-[70%]'
                    : 'self-start bg-gray-100 text-gray-800 rounded-lg px-4 py-2 max-w-[70%]'
                }
              >
                <span className="block text-xs mb-1 font-semibold">
                  {message.senderType === 'AI' ? 'AI' : 'ユーザー'}
                </span>
                <span>{message.content}</span>
              </div>
            ))}
            {isLoading && (
              <div className="self-end flex items-center gap-2 mt-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="text-blue-500 text-sm">送信中...</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  送信中...
                </span>
              ) : (
                '送信'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 