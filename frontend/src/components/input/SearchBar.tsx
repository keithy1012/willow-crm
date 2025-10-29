import React, { useState, useRef, useEffect } from "react";
import { MagnifyingGlass, Calendar } from "phosphor-react";

interface DoctorSearchBarProps {
  onSearch?: (doctorQuery: string, availabilityQuery: string) => void;
}

const DoctorSearchBar: React.FC<DoctorSearchBarProps> = ({ onSearch }) => {
  const [doctorQuery, setDoctorQuery] = useState("");
  const [availabilityQuery, setAvailabilityQuery] = useState("");
  const [focusedSection, setFocusedSection] = useState<
    "doctor" | "availability" | null
  >(null);
  const [selected, setSelected] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        availabilityRef.current &&
        !availabilityRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
        setFocusedSection(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(doctorQuery, availabilityQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAvailabilityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCalendar(true);
    setFocusedSection("availability");
  };

  const handleDateSelect = (date: Date) => {
    setSelected(date);
    setAvailabilityQuery(date.toLocaleDateString());
    setShowCalendar(false);
    setFocusedSection(null);
  };

  // Generate calendar days for current view month
  const generateCalendarDays = (): (Date | null)[] => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (e: React.MouseEvent, direction: "prev" | "next") => {
    // stop the calendar from closing when navigating the months
    e.stopPropagation();

    const newDate = new Date(viewDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
  };

  return (
    <div className="relative">
      <div className="bg-foreground rounded-full border-1 border-stroke shadow-md p-2 flex items-center gap-1 max-w-4xl mx-auto">
        <div
          className={`flex items-center flex-1 px-4 py-3 rounded-full transition-all duration-200 ${
            focusedSection === "doctor"
              ? "bg-background shadow-sm border border-stroke"
              : "bg-transparent hover:bg-background hover:bg-opacity-50"
          }`}
        >
          <MagnifyingGlass
            size={20}
            className="text-secondaryText mr-3 flex-shrink-0"
          />
          <input
            type="text"
            placeholder="Search for a doctor"
            value={doctorQuery}
            onChange={(e) => setDoctorQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setFocusedSection("doctor")}
            onBlur={() => setFocusedSection(null)}
            className="w-full bg-transparent outline-none text-primaryText placeholder-secondaryText text-base"
          />
        </div>

        <div
          className={`w-px h-8 bg-stroke transition-opacity duration-200 ${
            focusedSection === "doctor" || focusedSection === "availability"
              ? "opacity-30"
              : "opacity-100"
          }`}
        ></div>

        <div
          ref={availabilityRef}
          onClick={handleAvailabilityClick}
          className={`flex items-center flex-1 px-4 py-3 rounded-full transition-all duration-200 cursor-pointer ${
            focusedSection === "availability"
              ? "bg-background shadow-sm border border-stroke"
              : "bg-transparent hover:bg-background hover:bg-opacity-50"
          }`}
        >
          <Calendar
            size={20}
            className="text-secondaryText mr-3 flex-shrink-0"
          />
          <input
            type="text"
            placeholder="Search by availability"
            value={availabilityQuery}
            onChange={(e) => setAvailabilityQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onClick={handleAvailabilityClick}
            onFocus={(e) => {
              e.stopPropagation();
              setFocusedSection("availability");
              setShowCalendar(true);
            }}
            className="w-full bg-transparent outline-none text-primaryText placeholder-secondaryText text-base cursor-pointer"
            readOnly={showCalendar} // Prevent typing while calendar is open
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-primary text-white px-8 py-3 rounded-full hover:bg-opacity-90 transition-all duration-200 font-medium text-base flex-shrink-0"
        >
          Search
        </button>
      </div>

      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
          style={{
            left: "50%",
            transform: "translateX(-15%)",
            minWidth: "320px",
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside calendar
        >
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={(e) => navigateMonth(e, "prev")}
              className="p-2 hover:bg-gray-100 text-secondaryText rounded transition-colors"
              type="button"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold text-secondaryText">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h3>
            <button
              onClick={(e) => navigateMonth(e, "next")}
              className="p-2 hover:bg-gray-100 text-secondaryText rounded transition-colors"
              type="button"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="p-2"></div>;
              }

              const isSelected =
                selected &&
                date.getDate() === selected.getDate() &&
                date.getMonth() === selected.getMonth() &&
                date.getFullYear() === selected.getFullYear();

              const isToday =
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={`day-${date.getDate()}-${date.getMonth()}`}
                  onClick={() => handleDateSelect(date)}
                  type="button"
                  className={`
                    p-2 text-sm rounded transition-all duration-150
                    ${
                      isSelected
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                    ${
                      isToday && !isSelected
                        ? "bg-blue-50 font-semibold text-primary"
                        : ""
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearchBar;
