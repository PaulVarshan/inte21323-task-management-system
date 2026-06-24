import React, { type InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({ label, id, icon, ...props }) => {
  return (
    <div style={{ width: '100%' }}>
      {label && <label htmlFor={id} style={{ display: 'none' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }}>
            {icon}
          </span>
        )}
        <input 
          id={id} 
          className="input-field" 
          style={{ 
            paddingLeft: icon ? '2.75rem' : '1rem',
            margin: 0, 
            backgroundColor: '#f3f4f6'
          }} 
          {...props} 
        />
      </div>
    </div>
  );
};
