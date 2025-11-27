import React, { useState, useRef, useEffect } from "react";
import { CaretUp, CaretDown } from "phosphor-react";

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  className?: string;
}

const Dropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-sm text-primaryText font-medium mb-2 block">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-stroke rounded-xl text-left flex items-center justify-between hover:border-primary/30 transition-colors focus:outline-none focus:ring-0.5 focus:ring-primary/20"
      >
        <span
          className={`text-base ${
            value ? "text-primaryText" : "text-secondaryText"
          }`}
        >
          {value || placeholder}
        </span>
        {isOpen ? (
          <CaretUp size={20} className="text-secondaryText" />
        ) : (
          <CaretDown size={20} className="text-secondaryText" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-stroke rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group
                ${
                  value === option
                    ? "bg-primary/5 text-primary font-medium"
                    : "text-primaryText"
                }`}
            >
              <span className="text-base">{option}</span>
              {value === option && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
