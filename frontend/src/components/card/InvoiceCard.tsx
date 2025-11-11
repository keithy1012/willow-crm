import React from "react";

interface InvoiceCardProps {
  doctorName: string;
  status: string;
  appointmentDate: string;
  patientName?: string;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  doctorName,
  status,
  appointmentDate,
  patientName,
}) => {
  // Status styling based on status type
  const getStatusStyles = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Status Badge at top */}
      <div className="mb-3">
        <div
          className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyles(
            status
          )}`}
        >
          {status.toUpperCase()}
        </div>
      </div>

      {/* Patient Name */}
      {patientName && (
        <h3 className="font-semibold text-gray-800 text-lg mb-2">
          {patientName}
        </h3>
      )}

      {/* Doctor Info */}
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Doctor:</span> {doctorName}
      </p>

      {/* Appointment Date */}
      <p className="text-sm text-gray-600">
        <span className="font-medium">Date:</span> {appointmentDate}
      </p>
    </div>
  );
};

export default InvoiceCard;