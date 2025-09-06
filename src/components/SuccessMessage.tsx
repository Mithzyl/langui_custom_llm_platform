import React from 'react';

interface SuccessMessageProps {
  show: boolean;
  message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ show, message }) => {
  if (!show) return null;

  return (
    <div className="transition-opacity duration-300 ease-in-out">
      <span className="inline-flex items-center gap-x-1 rounded-full px-2.5 py-1 text-sm font-semibold leading-5 text-green-600 animate-fade-in-out">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
          <path d="M9 12l2 2l4 -4"></path>
        </svg>
        {message}
      </span>
    </div>
  );
};

export default SuccessMessage; 