
import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

const agents = [
  { id: 'agent1', name: 'Agent 1' },
  { id: 'agent2', name: 'Agent 2' },
];

interface Message {
  id: number;
  sender: 'user' | 'agent';
  content: string;
  message_id?: string;
}

const bubbleBase =
  'inline-block px-4 py-2 rounded-2xl shadow-md max-w-[70%] break-words transition-all duration-300';

const BACKEND_HOST = "localhost"; // Change if backend is elsewhere
const BACKEND_HTTP = `http://${BACKEND_HOST}:8000`;
const BACKEND_WS = `ws://${BACKEND_HOST}:8000`;
const USER_ID = "user1";

const ChatScreen: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState(agents[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Start conversation and connect WebSocket when agent changes
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;
    setMessages([]);
    setLoading(false);
    setConversationId(null);
    // 1. Start conversation
    fetch(`${BACKEND_HTTP}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: selectedAgent, user_id: USER_ID }),
    })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const convId = data.conversation_id;
        setConversationId(convId);
        // 2. Open WebSocket
        ws = new WebSocket(`${BACKEND_WS}/ws/chat/${convId}`);
        wsRef.current = ws;
        ws.onopen = () => {
          // Ready to send/receive
        };
        ws.onmessage = (event) => {
          try {
            const msgData = JSON.parse(event.data);
            setMessages(msgs => {
              // Find the agent message with this message_id
              const agentMsgIdx = msgs.findIndex(
                m => m.sender === 'agent' && m.message_id === msgData.message_id
              );

              if (msgData.streaming && agentMsgIdx !== -1) {
                // Append new content to the existing agent message bubble
                return [
                  ...msgs.slice(0, agentMsgIdx),
                  {
                    ...msgs[agentMsgIdx],
                    content: msgs[agentMsgIdx].content + msgData.message,
                  },
                  ...msgs.slice(agentMsgIdx + 1),
                ];
              }

              // Otherwise, create a new agent message bubble
              return [
                ...msgs,
                {
                  id: Date.now() + Math.random(),
                  sender: 'agent',
                  content: msgData.message,
                  message_id: msgData.message_id,
                },
              ];
            });
            setLoading(false);
          } catch (e) {
            // Ignore malformed
          }
        };
        ws.onerror = () => {
          setLoading(false);
        };
        ws.onclose = () => {
          // Optionally notify user
        };
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedAgent]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      content: input,
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    // Send to backend
    wsRef.current.send(
      JSON.stringify({
        message: input,
        user_id: USER_ID,
        agent_id: selectedAgent,
      })
    );
  };

  return (
    <div className="w-screen h-screen bg-gray-100">
      <div className="w-full h-full flex flex-col overflow-hidden px-4 md:px-16">
        {/* Header */}
        <div className="flex flex-row items-center justify-between h-20 px-0 md:px-4 bg-blue-600 text-white shadow-md z-10">
          <div className="flex items-center gap-4 pl-6 md:pl-10">
            <button onClick={() => navigate("/home")} className="font-bold text-lg hover:underline">Home</button>
            <span className="font-bold text-2xl tracking-tight">Chat</span>
          </div>
          <div className="flex items-center gap-2 pr-6 md:pr-10">
            <label className="font-medium mr-2">Agent:</label>
            <select
              className="rounded-lg px-2 py-1 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Feed */}
        <div
          ref={feedRef}
          className="flex-1 overflow-y-auto px-2 md:px-8 py-6 bg-white scrollbar-thin scrollbar-thumb-blue-200 border-x border-gray-200"
        >
          {messages.length === 0 ? (
            <div className="text-gray-300 text-center pt-12 text-lg animate-fade-in">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`w-full flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <span
                  className={
                    bubbleBase +
                    ' chat-message animate-bubble ' +
                    (msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-lg'
                      : 'bg-gray-200 text-gray-800 rounded-bl-lg')
                  }
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {msg.sender === 'agent' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </span>
              </div>
            ))
          )}
          {loading && (
            <div className="w-full flex justify-start mb-2">
              <span className="inline-block bg-gray-200/80 px-4 py-2 rounded-2xl">
                <span className="loading-dots" style={{ letterSpacing: '2px' }}>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Input Composer */}
        <div className="px-2 md:px-8 py-5 bg-white border-t border-gray-200 flex items-center">
          <div className="flex w-full items-center gap-1">
            <input
              className="flex-1 px-4 py-3 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white text-gray-700 transition-all duration-200 rounded-xl h-12"
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={loading}
              autoFocus
            />
            <button
              className="min-w-[90px] h-12 text-white font-bold px-6 rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#2563eb' }}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes bubble-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-bubble {
          animation: bubble-in 0.35s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0.7; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }
        .loading-dots .dot {
          display: inline-block;
          font-size: 1.5rem;
          line-height: 1;
          opacity: 0.5;
          animation: dotPulse 1.2s infinite ease-in-out;
        }
        .loading-dots .dot:nth-child(1) { animation-delay: 0s; }
        .loading-dots .dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.5; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
};

export default ChatScreen;
