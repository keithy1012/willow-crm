import React from "react";

interface Condition {
  conditionName: string;
}

interface PatientHistoryTableProps {
  conditions: Condition[] | undefined;
}

const PatientMedicalHistoryTable: React.FC<PatientHistoryTableProps> = ({
  conditions,
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Patient Medical History</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3 text-left font-medium text-gray-600">
                Condition
              </th>
            </tr>
          </thead>
          <tbody>
            {conditions && conditions.length > 0 ? (
              conditions.map((condition, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 px-3">
                    {condition.conditionName || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 px-3 text-gray-500 text-center">
                  No conditions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientMedicalHistoryTable;
