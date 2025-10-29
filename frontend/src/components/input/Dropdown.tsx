import React from "react";

interface DropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-gray-600 mb-2 text-sm font-medium">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full h-12 px-4 border border-stroke rounded-lg bg-transparent
          text-primaryText placeholder-secondaryText text-base
          outline-none focus:ring-2 focus:ring-blue-500
          cursor-pointer
        "
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}

        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
