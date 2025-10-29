import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssistantFloatingButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/assistant');
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-50"
    >
      <Bot className="w-6 h-6 text-white" />
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
          Assistant IA
          <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
        </div>
      )}
    </button>
  );
};

export default AssistantFloatingButton;
