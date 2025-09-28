import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import { BACKEND_HTTP, BACKEND_WS } from './config';
import { tenants } from './tenants';

const agents = [
  { id: 'agent1', name: 'Finance Expert' },
  { id: 'agent2', name: 'HR Expert' },
  { id: 'agent3', name: 'IT Expert' },
  { id: 'agent4', name: 'Legal Expert' },
  { id: 'agent5', name: 'Marketing Expert' },
];

interface Message {
  id: number;
  sender: 'user' | 'agent';
  content: string;
  message_id?: string;
}

const bubbleBase =
  'inline-block px-4 py-2 rounded-2xl shadow-md max-w-[70%] break-words transition-all duration-300';

const USER_ID = "user1";

const ChatScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const tenant = tenants.find(t => t.slug === slug);
  const tenantId = tenant ? tenant.id : '';
  const agentId = tenant ? tenant.agent_id : agents[0].id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Start conversation and connect WebSocket when agent or tenant changes
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;
    setMessages([]);
    setLoading(false);
    // 1. Start conversation
    fetch(`${BACKEND_HTTP}/api/v1/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId, user_id: USER_ID, tenant_id: tenantId }),
    })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const convId = data.conversation_id;
        // 2. Open WebSocket
        ws = new WebSocket(`${BACKEND_WS}/api/v1/ws/chat/${convId}`);
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
  }, [agentId, tenantId]);

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
        agent_id: agentId,
        tenant_id: tenantId,
      })
    );
  };

  return (
    <Navbar>
      <div className="w-full h-screen bg-blue-50 overflow-hidden">
        <div className="w-full h-full flex flex-col overflow-hidden px-4 md:px-16">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 md:px-8 bg-gradient-to-r from-[#476EAE]/10 to-white border-b border-[#48B3AF]/20">
            <div className="flex items-center">
              <div className="mr-3 bg-gradient-to-br from-[#476EAE] to-[#48B3AF] rounded-full p-2 shadow-md">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-2xl text-[#476EAE]">Strategy Bot</h3>
                <p className="text-sm text-[#48B3AF]">Chat with your AI assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#476EAE]/10 px-3 py-2 rounded-lg shadow-sm border border-[#48B3AF]/20">
              <span className="font-medium text-sm text-[#476EAE]">
                {tenant?.name || ""}
              </span>
            </div>
          </div>

          {/* Message Feed */}
          <div
            ref={feedRef}
            className="flex-1 overflow-y-auto px-2 md:px-8 py-6 bg-white scrollbar-thin scrollbar-thumb-[#48B3AF]/30 border-x border-[#48B3AF]/20"
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
                        ? 'bg-gradient-to-r from-[#476EAE] to-[#48B3AF] text-white rounded-br-lg'
                        : 'bg-gray-100 text-gray-800 rounded-bl-lg')
                    }
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {msg.sender === 'agent' ? (
                      <div className="markdown-content">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeSanitize]}
                          components={{
                            code({inline, className, children, ...props}: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={atomDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={`${className} px-1 py-0.5 rounded bg-gray-200 text-gray-800`} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            table({ node, ...props }: any) {
                              return (
                                <div className="overflow-x-auto my-2">
                                  <table className="min-w-full divide-y divide-gray-300 border border-gray-300" {...props} />
                                </div>
                              );
                            },
                            thead({ node, ...props }: any) {
                              return <thead className="bg-gray-100" {...props} />;
                            },
                            th({ node, ...props }: any) {
                              return <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider" {...props} />;
                            },
                            td({ node, ...props }: any) {
                              return <td className="px-3 py-2 whitespace-nowrap text-sm" {...props} />;
                            },
                            a({ node, ...props }: any) {
                              return <a className="text-[#476EAE] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />;
                            },
                            p({ node, ...props }: any) {
                              return <p className="mb-4 last:mb-0" {...props} />;
                            },
                            ul({ node, ...props }: any) {
                              return <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />;
                            },
                            ol({ node, ...props }: any) {
                              return <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />;
                            },
                            li({ node, ...props }: any) {
                              return <li className="mb-1" {...props} />;
                            },
                            h1({ node, ...props }: any) {
                              return <h1 className="text-xl font-bold mb-4 mt-6" {...props} />;
                            },
                            h2({ node, ...props }: any) {
                              return <h2 className="text-lg font-bold mb-3 mt-5" {...props} />;
                            },
                            h3({ node, ...props }: any) {
                              return <h3 className="text-md font-bold mb-2 mt-4" {...props} />;
                            },
                            blockquote({ node, ...props }: any) {
                              return <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700" {...props} />;
                            },
                            hr({ node, ...props }: any) {
                              return <hr className="my-6 border-t border-gray-300" {...props} />;
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
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
          <div className="px-2 md:px-8 py-5 bg-white border-t border-[#48B3AF]/20 flex items-center">
            <div className="flex w-full items-center gap-1">
              <input
                className="flex-1 px-4 py-3 border border-[#48B3AF]/30 focus:outline-none focus:ring-2 focus:ring-[#476EAE]/50 shadow-sm bg-white text-gray-700 transition-all duration-200 rounded-xl h-12"
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
                className="min-w-[90px] h-12 text-white font-bold px-6 rounded-xl shadow-lg hover:opacity-90 hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right,rgb(23, 97, 214),rgb(49, 136, 130))' }}
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
          .markdown-content {
  font-size: 1rem;               /* make text readable */
  line-height: 1.6;
  color: #1f2937;                /* Tailwind gray-800 */
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin: 0.5em 0 0.3em;
  font-weight: 600;
  color: #476EAE;                /* matches your brand */
}

.markdown-content p {
  margin: 0.3em 0;
}

.markdown-content ul {
  list-style-type: disc;
  padding-left: 1.2rem;
  margin: 0.4em 0;
}

.markdown-content li {
  margin-bottom: 0.2em;
}

        `}</style>
      </div>
    </Navbar>
  );
};

export default ChatScreen;
