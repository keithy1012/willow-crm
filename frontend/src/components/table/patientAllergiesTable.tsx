import React from "react";

interface Allergy {
  allergen: string;
}

interface PatientAllergiesTableProps {
  allergies: Allergy[] | undefined;
}

const PatientAllergiesTable: React.FC<PatientAllergiesTableProps> = ({
  allergies,
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Patient Allergies</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3 text-left font-medium text-gray-600">
                Allergy
              </th>
            </tr>
          </thead>
          <tbody>
            {allergies && allergies.length > 0 ? (
              allergies.map((allergy, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 px-3">{allergy.allergen || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 px-3 text-gray-500 text-center">
                  No allergies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientAllergiesTable;
