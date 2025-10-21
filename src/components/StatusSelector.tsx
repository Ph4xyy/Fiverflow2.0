import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Moon, 
  ChevronDown 
} from 'lucide-react';

export type UserStatus = 'available' | 'busy' | 'away' | 'do_not_disturb';

interface StatusOption {
  value: UserStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface StatusSelectorProps {
  currentStatus: UserStatus;
  onStatusChange: (status: UserStatus) => void;
  disabled?: boolean;
}

const statusOptions: StatusOption[] = [
  {
    value: 'available',
    label: 'Disponible',
    description: 'En ligne et disponible',
    icon: <CheckCircle size={16} />,
    color: 'text-green-400'
  },
  {
    value: 'busy',
    label: 'Occupé',
    description: 'En ligne mais occupé',
    icon: <Clock size={16} />,
    color: 'text-yellow-400'
  },
  {
    value: 'away',
    label: 'Absent',
    description: 'Hors ligne ou absent',
    icon: <XCircle size={16} />,
    color: 'text-orange-400'
  },
  {
    value: 'do_not_disturb',
    label: 'Ne pas déranger',
    description: 'Ne pas déranger',
    icon: <Moon size={16} />,
    color: 'text-red-400'
  }
];

const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = statusOptions.find(option => option.value === currentStatus);

  const handleStatusSelect = (status: UserStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
          ${disabled 
            ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-[#35414e] border-[#1e2938] text-white hover:bg-[#3d4a57]'
          }
        `}
      >
        {currentOption && (
          <>
            <span className={currentOption.color}>
              {currentOption.icon}
            </span>
            <span className="text-sm font-medium">
              {currentOption.label}
            </span>
          </>
        )}
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#2a3441] border border-[#1e2938] rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-400 mb-2 px-2">
                Changer le statut
              </div>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusSelect(option.value)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${currentStatus === option.value 
                      ? 'bg-[#9c68f2]/20 text-white' 
                      : 'text-gray-300 hover:bg-[#35414e] hover:text-white'
                    }
                  `}
                >
                  <span className={option.color}>
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  {currentStatus === option.value && (
                    <CheckCircle size={16} className="text-[#9c68f2]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusSelector;
