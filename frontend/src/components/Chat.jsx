import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBooleanFlagValue } from '@openfeature/react-sdk';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const flag = useBooleanFlagValue('file-attachment', false);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const response = await fetch('/api/chat');
      return response.json();
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (content) => {
      console.log("Sending message:", content);
      const formData = new FormData();
      formData.append('message', content);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        body: formData
      });
      return response.text();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessage('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  });

  const resetChat = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/chat/reset', { method: 'POST' });
      if (!response.ok) {
        throw new Error('リセットに失敗しました');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("handleSubmit called", message);
    if (message.trim()) {
      sendMessage.mutate(message);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">チャット</h1>
          <button
            onClick={() => resetChat.mutate()}
            disabled={resetChat.isPending}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            チャット履歴クリア
          </button>
        </div>
        <div className="mb-4 h-[calc(100vh-300px)] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-lg ${
                msg.senderType === 'USER' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
              } max-w-[80%]`}
            >
              <p className="text-gray-800">{msg.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {flag && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <span className="text-sm text-gray-600">
                  選択中: {file.name}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sendMessage.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat; 