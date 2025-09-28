import React from 'react';
import Navbar from '../components/Navbar';

const PersonaBuilder: React.FC = () => {
  return (
    <Navbar>
      <div className="h-full w-full flex flex-col bg-blue-50 overflow-y-auto">
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
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-[#476EAE]">Build your persona</h3>
              <p className="text-sm text-[#48B3AF]">Create and customize your AI assistant</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p>This feature is under development</p>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default PersonaBuilder;
