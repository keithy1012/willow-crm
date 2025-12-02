import React, { useState, useEffect } from "react";
import { ArrowElbowLeft, ArrowElbowRight } from "phosphor-react";

interface CalendarProps {
  selectedDates?: Date[];
  highlightedDates?: Date[];
  appointmentDates?: Date[]; // New prop for appointment dates
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (month: Date) => void;
  currentMonth?: Date;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDates = [],
  highlightedDates = [],
  appointmentDates = [], // Default to empty array
  onDateSelect,
  onMonthChange,
  currentMonth,
  className = "",
  minDate,
  maxDate,
}) => {
  const [viewDate, setViewDate] = useState(currentMonth || new Date());

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

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Generate calendar days for current view month
  const generateCalendarDays = (): (Date | null)[] => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push(new Date(currentYear, currentMonth - 1, day));
    }

    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    // Add days from next month to complete the last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(currentYear, currentMonth + 1, i));
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);

    // Notify parent component about month change
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDates.some(
      (selected) =>
        selected.getDate() === date.getDate() &&
        selected.getMonth() === date.getMonth() &&
        selected.getFullYear() === date.getFullYear()
    );
  };

  const isDateHighlighted = (date: Date): boolean => {
    return highlightedDates.some(
      (highlighted) =>
        highlighted.getDate() === date.getDate() &&
        highlighted.getMonth() === date.getMonth() &&
        highlighted.getFullYear() === date.getFullYear()
    );
  };

  const hasAppointment = (date: Date): boolean => {
    return appointmentDates.some(
      (appointment) =>
        appointment.getDate() === date.getDate() &&
        appointment.getMonth() === date.getMonth() &&
        appointment.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === viewDate.getMonth();
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date) && onDateSelect) {
      onDateSelect(date);
    }
  };

  // Update viewDate when currentMonth prop changes
  useEffect(() => {
    if (currentMonth) {
      setViewDate(currentMonth);
    }
  }, [currentMonth]);

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          type="button"
          aria-label="Previous month"
        >
          <ArrowElbowLeft size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h2>

        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          type="button"
          aria-label="Next month"
        >
          <ArrowElbowRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {generateCalendarDays().map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;

          const isSelected = isDateSelected(date);
          const isHighlighted = isDateHighlighted(date);
          const hasAppt = hasAppointment(date);
          const isTodayDate = isToday(date);
          const isInCurrentMonth = isCurrentMonth(date);
          const isDisabled = isDateDisabled(date);

          return (
            <div key={`day-${index}`} className="aspect-[3/2] p-1">
              <button
                onClick={() => handleDateClick(date)}
                disabled={isDisabled}
                type="button"
                className={`
                  w-full h-full flex flex-col items-center justify-center
                  text-md font-medium rounded-lg
                  transition-all duration-150
                  relative
                  ${!isInCurrentMonth ? "text-gray-400" : "text-gray-900"}
                  ${
                    isSelected
                      ? "bg-primary text-white hover:bg-primary/90"
                      : isHighlighted
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : isTodayDate
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "hover:bg-gray-100"
                  }
                  ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                {date.getDate()}
                {/* Show indicators for available dates and appointments */}
                <div className="flex gap-1 mt-1">
                  {isHighlighted && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  )}
                  {hasAppt && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
