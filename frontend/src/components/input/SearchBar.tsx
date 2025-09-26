import React, { useState } from "react";
import { MagnifyingGlass, Calendar } from "@phosphor-icons/react";

interface DoctorSearchBarProps {
  onSearch?: (doctorQuery: string, availabilityQuery: string) => void;
}

const DoctorSearchBar: React.FC<DoctorSearchBarProps> = ({ onSearch }) => {
  const [doctorQuery, setDoctorQuery] = useState("");
  const [availabilityQuery, setAvailabilityQuery] = useState("");
  const [focusedSection, setFocusedSection] = useState<'doctor' | 'availability' | null>(null);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(doctorQuery, availabilityQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-foreground rounded-full border-1 border-stroke shadow-md p-2 flex items-center gap-1 max-w-4xl mx-auto">
      <div 
        className={`flex items-center flex-1 px-4 py-3 rounded-full transition-all duration-200 ${
          focusedSection === 'doctor' 
            ? 'bg-background shadow-sm border border-stroke' 
            : 'bg-transparent hover:bg-background hover:bg-opacity-50'
        }`}
      >
        <MagnifyingGlass size={20} className="text-secondaryText mr-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search for a doctor"
          value={doctorQuery}
          onChange={(e) => setDoctorQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setFocusedSection('doctor')}
          onBlur={() => setFocusedSection(null)}
          className="w-full bg-transparent outline-none text-primaryText placeholder-secondaryText text-base"
        />
      </div>

      <div className={`w-px h-8 bg-stroke transition-opacity duration-200 ${
        focusedSection === 'doctor' || focusedSection === 'availability' ? 'opacity-30' : 'opacity-100'
      }`}></div>
      <div 
        className={`flex items-center flex-1 px-4 py-3 rounded-full transition-all duration-200 ${
          focusedSection === 'availability' 
            ? 'bg-background shadow-sm border border-stroke' 
            : 'bg-transparent hover:bg-background hover:bg-opacity-50'
        }`}
      >
        <Calendar size={20} className="text-secondaryText mr-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by availability"
          value={availabilityQuery}
          onChange={(e) => setAvailabilityQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setFocusedSection('availability')}
          onBlur={() => setFocusedSection(null)}
          className="w-full bg-transparent outline-none text-primaryText placeholder-secondaryText text-base"
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-primary text-background px-8 py-3 rounded-full hover:bg-opacity-90 transition-all duration-200 font-medium text-base flex-shrink-0"
      >
        Search
      </button>
    </div>
  );
};

export default DoctorSearchBar;