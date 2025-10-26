import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
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
      ${className}
    `}>
      {(title || icon) && (
        <div className="mb-4">
          {title && typeof title === 'string' ? (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default ModernCard;
