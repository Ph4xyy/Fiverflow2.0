import React from 'react';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ModernButton: React.FC<ModernButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9c68f2]';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#9c68f2] to-[#422ca5] text-white hover:from-[#8a5cf0] hover:to-[#3a2590] shadow-lg hover:shadow-xl',
    secondary: 'bg-[#35414e] text-white hover:bg-[#3d4a57]',
    outline: 'border border-[#35414e] text-white hover:bg-[#35414e]'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default ModernButton;
