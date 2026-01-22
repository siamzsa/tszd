'use client';

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export default function GenerateButton({ onClick, disabled, isLoading }: GenerateButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && !isLoading) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        w-full py-4 px-6 rounded-xl font-bold text-white text-base
        transition-all duration-300 transform
        ${disabled || isLoading
          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
        }
        focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
        disabled:transform-none disabled:hover:scale-100
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-semibold">Generating Signal...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-bold">Generate Signal</span>
        </span>
      )}
    </button>
  );
}


