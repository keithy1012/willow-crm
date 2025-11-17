import React, { useState } from "react";
import { ChartBar } from "phosphor-react";
import Field from "components/input/Field";
import PrimaryButton from "components/buttons/PrimaryButton";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (reportType: string, startDate: string, endDate: string) => void;
}

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [reportType, setReportType] = useState("monthly-revenue");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date must be before end date");
      return;
    }

    onGenerate(reportType, startDate, endDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full">
              <ChartBar size={20} weight="regular" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Generate Report
            </h3>
          </div>
          <p className="text-sm text-gray-500">
            Select report type and date range
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="monthly-revenue">Monthly Revenue Report</option>
              <option value="quarterly-summary">Quarterly Summary</option>
              <option value="aging-report">Aging Report</option>
              <option value="collection-rate">Collection Rate Analysis</option>
              <option value="outstanding-receivables">Outstanding Receivables</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Field
              placeholder="2025-01-01"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Field
              placeholder="2025-01-31"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <PrimaryButton
            text="Cancel"
            onClick={onClose}
            variant="outline"
            size="medium"
            toggleable={false}
            className="flex-1"
          />
          <PrimaryButton
            text="Generate"
            onClick={handleGenerate}
            variant="primary"
            size="medium"
            toggleable={false}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;