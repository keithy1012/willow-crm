import React, { useState } from "react";
import { ArrowElbowLeft, ArrowElbowRight } from "phosphor-react";

interface CalendarProps {
  selectedDates?: Date[];
  onDateSelect?: (date: Date) => void;
  highlightedDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDates = [],
  onDateSelect,
  highlightedDates = [],
  minDate,
  maxDate,
  className = "",
}) => {
  const [viewDate, setViewDate] = useState(new Date());

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
                  w-full h-full flex items-center justify-center
                  text-md font-medium rounded-lg
                  transition-all duration-150
                  relative
                  ${!isInCurrentMonth ? "text-gray-400" : "text-gray-900"}
                  ${
                    isSelected
                      ? "bg-primary text-white hover:bg-primary/90"
                      : isHighlighted
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
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
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
