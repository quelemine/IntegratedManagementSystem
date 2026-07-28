import React from 'react';

const Switch = ({ id, checked, onCheckedChange, disabled = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={id}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

export { Switch };
