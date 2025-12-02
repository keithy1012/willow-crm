import React, { useState, useRef, useEffect } from "react";
import { MagnifyingGlass, Calendar } from "phosphor-react";
import { availabilityService } from "api/services/availability.service";
import { AvailableDoctorResult } from "api/types/availability.types";
import toast from "react-hot-toast";

interface DoctorSearchBarProps {
  onSearch?: (doctorQuery: string, availabilityQuery: string) => void;
  onResults?: (results: AvailableDoctorResult[]) => void;
}

const DoctorSearchBar: React.FC<DoctorSearchBarProps> = ({
  onSearch,
  onResults,
}) => {
  const [doctorQuery, setDoctorQuery] = useState("");
  const [availabilityQuery, setAvailabilityQuery] = useState("");
  const [focusedSection, setFocusedSection] = useState<
    "doctor" | "availability" | null
  >(null);
  const [selected, setSelected] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [isSearching, setIsSearching] = useState(false);
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

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    setIsSearching(true);

    try {
      // Prepare search parameters
      const searchParams: { date?: string; name?: string } = {};

      // If a date is selected, use that date
      if (selected && availabilityQuery) {
        searchParams.date = formatDateForAPI(selected);
      } else if (doctorQuery && !availabilityQuery) {
        // If only name is searched, use today's date
        searchParams.date = formatDateForAPI(new Date());
      }

      // Add doctor name if provided
      if (doctorQuery.trim()) {
        searchParams.name = doctorQuery.trim();
      }

      // If neither date nor name is provided, show an error
      if (!searchParams.date && !searchParams.name) {
        toast.error("Please enter a doctor name or select a date");
        setIsSearching(false);
        return;
      }

      // Call the availability search API
      const response = await availabilityService.searchByDateTime(searchParams);

      if (response.doctors && response.doctors.length > 0) {
        toast.success(
          `Found ${response.doctors.length} available doctor${
            response.doctors.length > 1 ? "s" : ""
          }`
        );

        // Pass results to parent component if handler is provided
        if (onResults) {
          onResults(response.doctors);
        }
      } else {
        let message = "No doctors found";
        if (searchParams.name && searchParams.date) {
          const dateStr = selected
            ? selected.toLocaleDateString()
            : new Date().toLocaleDateString();
          message = `No doctors named "${searchParams.name}" available on ${dateStr}`;
        } else if (searchParams.date) {
          const dateStr = selected
            ? selected.toLocaleDateString()
            : new Date().toLocaleDateString();
          message = `No doctors available on ${dateStr}`;
        } else if (searchParams.name) {
          message = `No doctors found with name "${searchParams.name}"`;
        }
        toast.error(message);

        if (onResults) {
          onResults([]);
        }
      }

      // Call the original onSearch callback if provided
      if (onSearch) {
        onSearch(doctorQuery, availabilityQuery);
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to search for doctors. Please try again.");
      if (onResults) {
        onResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) {
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

  const clearDateSelection = () => {
    setSelected(undefined);
    setAvailabilityQuery("");
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
          <div className="flex items-center w-full">
            <input
              type="text"
              placeholder="Select date (optional)"
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
              readOnly={showCalendar}
            />
            {availabilityQuery && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearDateSelection();
                }}
                className="ml-2 text-secondaryText hover:text-primaryText transition-colors"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching}
          className={`px-8 py-3 rounded-full font-medium text-base flex-shrink-0 transition-all duration-200 ${
            isSearching
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-primary text-white hover:bg-opacity-90"
          }`}
        >
          {isSearching ? "Searching..." : "Search"}
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
          onClick={(e) => e.stopPropagation()}
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

              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={`day-${date.getDate()}-${date.getMonth()}`}
                  onClick={() => handleDateSelect(date)}
                  type="button"
                  disabled={isPast}
                  className={`
                    p-2 text-sm rounded transition-all duration-150
                    ${
                      isPast
                        ? "opacity-50 cursor-not-allowed text-gray-400"
                        : ""
                    }
                    ${
                      isSelected
                        ? "bg-primary text-white hover:bg-primary/90"
                        : !isPast
                        ? "text-gray-700 hover:bg-gray-100"
                        : ""
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

          <div className="mt-3 text-xs text-secondaryText text-center">
            {!selected && "Select a date to search availability"}
            {selected && `Selected: ${selected.toLocaleDateString()}`}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearchBar;
