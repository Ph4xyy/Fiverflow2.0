import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
}

const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className = '', 
  title, 
  icon, 
  gradient = false 
}) => {
  return (
    <div className={`
      ${gradient ? 'bg-gradient-to-br from-[#9c68f2] to-[#422ca5]' : 'bg-[#1e2938]'} 
      border border-[#35414e] 
      rounded-xl 
      shadow-lg 
      p-6 
      transition-all duration-200 
      hover:shadow-xl 
      hover:scale-[1.02]
      ${className}
    `}>
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#35414e] text-white">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default ModernCard;
