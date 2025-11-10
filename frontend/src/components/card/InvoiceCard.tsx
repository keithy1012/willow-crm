import React from "react";

interface InvoiceCardProps {
  doctorName: string;
  doctorUsername: string;
  appointmentType: string;
  appointmentDate: string;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  doctorName,
  doctorUsername,
  appointmentType,
  appointmentDate,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Doctor Info */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">👨‍⚕️</span>
            <h3 className="font-semibold text-gray-800">{doctorName}</h3>
            <span className="text-sm text-gray-500">
              - {formatDate(appointmentDate)}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Doctor:</span> Dr.{" "}
              {doctorUsername.split("@")[1] || doctorUsername}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Appointment Type:</span>{" "}
              {appointmentType}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button className="px-4 py-2 bg-primary hover:bg-[#6886AC] text-white text-sm font-medium rounded-lg transition-colors">
          Message Doctor
        </button>
      </div>
    </div>
  );
};

export default InvoiceCard;