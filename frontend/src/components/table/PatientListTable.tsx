import React from "react";

interface GenericItem {
  [key: string]: any;
}

interface PatientListTableProps {
  title: string;
  data?: GenericItem[];
  field: string;
}

const PatientListTable: React.FC<PatientListTableProps> = ({
  title,
  data,
  field,
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3 text-left font-medium text-gray-600">
                {title}
              </th>
            </tr>
          </thead>

          <tbody>
            {data && data.length > 0 ? (
              data.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 px-3">{item[field] || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 px-3 text-gray-500 text-center">
                  No {title.toLowerCase()} found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientListTable;
