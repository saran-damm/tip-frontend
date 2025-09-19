
import React from "react";
import Card from "../Card";

const UploadIcon = (
  <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center shadow">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3v10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7l4-4 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 21H3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const ChatIcon = (
  <div className="w-20 h-20 rounded-full bg-green-400 flex items-center justify-center shadow">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function Home() {
  return (
    // full-screen flex center
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-5xl px-6">
        <h1 className="text-5xl text-center font-extrabold text-slate-800 mb-12">Welcome to the Dashboard</h1>

        {/* Cards centered and limited width */}
        <div className="flex flex-col md:flex-row items-stretch md:items-start gap-8 justify-center">
          <div className="flex-1 flex justify-center">
            <Card title="File Uploader" description="Upload and manage your files easily." icon={UploadIcon} target="/dropbox" />
          </div>
          <div className="flex-1 flex justify-center">
            <Card title="Chat" description="Start chatting with your AI assistant." icon={ChatIcon} target="/chat" />
          </div>
        </div>
      </div>
    </div>
  );
}
