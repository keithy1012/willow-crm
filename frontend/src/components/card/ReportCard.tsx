import React from "react";

interface ReportCardProps {
  reportId: string;
  reportType: string;
  dateRange: string;
  generatedDate: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  reportId,
  reportType,
  dateRange,
  generatedDate,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Report ID and Type */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-800 text-base mb-1">
          {reportId}
        </h3>
        <p className="text-sm text-gray-600">{reportType}</p>
      </div>

      {/* Date Information */}
      <div className="flex gap-4 text-sm text-gray-500">
        <div>
          <span className="font-medium">Date Range:</span> {dateRange}
        </div>
        <div>
          <span className="font-medium">Generated:</span> {generatedDate}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;