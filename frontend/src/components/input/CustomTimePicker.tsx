import { useState, useRef, useEffect } from "react";
import { Clock } from "phosphor-react";

interface SimpleTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CustomTimePicker: React.FC<SimpleTimePickerProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHour(h || "09");
      setMinute(m || "00");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Format display
  const formatDisplay = () => {
    if (!value) return "--:--";
    const [h, m] = value.split(":");
    const hourNum = parseInt(h || "0", 10);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${m || "00"} ${period}`;
  };

  // Handle hour/minute change
  const handleTimeChange = (newHour: string, newMinute: string) => {
    const timeValue = `${newHour}:${newMinute}`;
    onChange(timeValue);
    setHour(newHour);
    setMinute(newMinute);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 border border-stroke rounded-lg text-sm shadow-sm 
                   font-medium text-primaryText bg-white
                   hover:border-primary/50 focus:border-primary focus:outline-none 
                   focus:ring-4 focus:ring-primary/10 transition-all duration-200 ${className}`}
      >
        {formatDisplay()}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-stroke p-3">
          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1">Hour</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => {
                  const val = e.target.value.padStart(2, "0");
                  if (parseInt(val) <= 23) {
                    handleTimeChange(val, minute);
                  }
                }}
                className="w-14 px-2 py-1.5 text-center border border-stroke rounded-lg
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         text-sm font-medium"
              />
            </div>

            <span className="text-xl font-medium text-gray-400 mt-4">:</span>
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500 mb-1">Min</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => {
                  const val = e.target.value.padStart(2, "0");
                  if (parseInt(val) <= 59) {
                    handleTimeChange(hour, val);
                  }
                }}
                className="w-14 px-2 py-1.5 text-center border border-stroke rounded-lg
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         text-sm font-medium"
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-1">
            <button
              type="button"
              onClick={() => {
                handleTimeChange("09", "00");
                setIsOpen(false);
              }}
              className="border-[1px] border-stroke flex-1 text-xs py-1.5 px-2 bg-gray-50 hover:bg-primary/10 
                       text-gray-600 hover:text-primary rounded-lg transition-colors"
            >
              9:00 AM
            </button>
            <button
              type="button"
              onClick={() => {
                handleTimeChange("12", "00");
                setIsOpen(false);
              }}
              className="border-[1px] border-stroke flex-1 text-xs py-1.5 px-2 bg-gray-50 hover:bg-primary/10 
                       text-gray-600 hover:text-primary rounded-lg transition-colors"
            >
              12:00 PM
            </button>
            <button
              type="button"
              onClick={() => {
                handleTimeChange("17", "00");
                setIsOpen(false);
              }}
              className="border-[1px] border-stroke flex-1 text-xs py-1.5 px-2 bg-gray-50 hover:bg-primary/10 
                       text-gray-600 hover:text-primary rounded-lg transition-colors"
            >
              5:00 PM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
