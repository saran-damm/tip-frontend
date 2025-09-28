import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Icons for the navigation items
const TrainIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-3"
  >
    <path
      d="M12 3v10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 7l4-4 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 21H3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-3"
  >
    <path
      d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HomeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-3"
  >
    <path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 22V12h6v10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PersonaIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-3"
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
);

const TaskIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-3"
  >
    <path
      d="M9 11l3 3L22 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-3"
  >
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17l5-5-5-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12H9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface NavbarProps {
  children: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === `/${slug}${path}`;
  };
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-[#476EAE] to-[#48B3AF] text-white flex flex-col shadow-lg flex-shrink-0`}>
        {/* Logo/Brand and Toggle Button */}
        <div className={`${collapsed ? 'h-16 flex items-center justify-center' : 'p-4 flex items-center justify-between'} border-b border-white border-opacity-20`}>
          {!collapsed && (
            <div className="flex items-center group">
              <h1 className="text-xl relative">
                <span className="font-extrabold tracking-tight">TIP</span>
                <span className="text-[#48B3AF] font-normal relative">
                  <span className="relative">.</span>
                  <span className="font-medium">ai</span>
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#476EAE] to-[#48B3AF] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </h1>
            </div>
          )}
          <button 
            onClick={toggleSidebar} 
            className="focus:outline-none transition-all duration-200 rounded-md focus:ring-2 focus:ring-white focus:ring-opacity-30 p-1 hover:bg-white hover:bg-opacity-10"
            aria-label="Toggle sidebar"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white transition-opacity duration-300"
            >
              {collapsed ? (
                // Hamburger menu icon when collapsed - centered version
                <>
                  <path 
                    d="M4 6h16" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M4 12h16" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M4 18h16" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                </>
              ) : (
                // Hamburger menu icon with shorter lines when expanded
                <>
                  <path 
                    d="M4 6h12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M4 12h12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M4 18h12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 pt-6">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => navigate(`/${slug}/home`)}
                className={`flex items-center w-full ${collapsed ? 'justify-center px-2' : 'px-6'} py-3 text-left transition-all duration-200 ${
                  isActive('/home') 
                    ? 'bg-[#476EAE]/80 font-medium' 
                    : 'hover:bg-[#48B3AF]/70'
                } focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 focus:bg-[#48B3AF]/80`}
                title="Home"
              >
                <HomeIcon />
                {!collapsed && <span>Home</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate(`/${slug}/persona`)}
                className={`flex items-center w-full ${collapsed ? 'justify-center px-2' : 'px-6'} py-3 text-left transition-all duration-200 ${
                  isActive('/persona') 
                    ? 'bg-[#476EAE]/80 font-medium' 
                    : 'hover:bg-[#48B3AF]/70'
                } focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 focus:bg-[#48B3AF]/80`}
                title="Build your Persona"
              >
                <PersonaIcon />
                {!collapsed && <span>Build your Persona</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate(`/${slug}/train`)}
                className={`flex items-center w-full ${collapsed ? 'justify-center px-2' : 'px-6'} py-3 text-left transition-all duration-200 ${
                  isActive('/train') 
                    ? 'bg-[#476EAE]/80 font-medium' 
                    : 'hover:bg-[#48B3AF]/70'
                } focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 focus:bg-[#48B3AF]/80`}
                title="Train your bot"
              >
                <TrainIcon />
                {!collapsed && <span>Train your bot</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate(`/${slug}/bot`)}
                className={`flex items-center w-full ${collapsed ? 'justify-center px-2' : 'px-6'} py-3 text-left transition-all duration-200 ${
                  isActive('/bot') 
                    ? 'bg-[#476EAE]/80 font-medium' 
                    : 'hover:bg-[#48B3AF]/70'
                } focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 focus:bg-[#48B3AF]/80`}
                title="Strategy Bot"
              >
                <ChatIcon />
                {!collapsed && <span>Strategy Bot</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate(`/${slug}/tasks`)}
                className={`flex items-center w-full ${collapsed ? 'justify-center px-2' : 'px-6'} py-3 text-left transition-all duration-200 ${
                  isActive('/tasks') 
                    ? 'bg-[#476EAE]/80 font-medium' 
                    : 'hover:bg-[#48B3AF]/70'
                } focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 focus:bg-[#48B3AF]/80`}
                title="Task Tracker"
              >
                <TaskIcon />
                {!collapsed && <span>Task Tracker</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className={`${collapsed ? 'p-3' : 'p-6'} border-t border-white border-opacity-20`}>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full ${collapsed ? 'justify-center p-2' : 'px-4 py-2 text-left'} hover:bg-[#48B3AF]/70 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 focus:bg-[#48B3AF]/80`}
            title="Logout"
          >
            <LogoutIcon />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </div>
  );
};

export default Navbar;
