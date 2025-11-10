import React from "react";
import { MagnifyingGlass } from "phosphor-react";

interface SmallSearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  onClear: () => void;
}

const SmallSearchBar = ({
  value,
  onChange,
  placeholder = "Search for a doctor...",
  onClear,
}: SmallSearchBarProps) => {
  return (
    <div className="relative">
      <MagnifyingGlass
        size={20}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondaryText"
      />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2 bg-foreground border text-primaryText border-stroke rounded-lg focus:outline-none transition-colors placeholder:text-secondaryText placeholder:text-sm"
      />

      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Clear search"
        >
          <svg
            className="w-4 h-4 text-secondaryText"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SmallSearchBar;
