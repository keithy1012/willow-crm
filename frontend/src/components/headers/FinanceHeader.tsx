import React from "react";

interface FinanceHeaderProps {
  userName?: string;
}

const FinanceHeader: React.FC<FinanceHeaderProps> = ({ userName }) => {
  return (
    <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-8">
      <h2 className="text-lg font-medium">
        Hello, {userName || "Finance"}
      </h2>
    </div>
  );
};

export default FinanceHeader;