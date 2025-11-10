import React, { useEffect, useState } from "react";
import ReportCard from "components/card/ReportCard";
import FinanceHeader from "components/headers/FinanceHeader";
import { useRequireRole } from "hooks/useRequireRole";
import { MagnifyingGlass } from "phosphor-react";

interface Report {
  _id: string;
  reportId: string;
  insuranceProvider: string;
  description: string;
}

const Billing: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const user = useRequireRole("Finance", true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = user?.token || localStorage.getItem("token") || "";

        const authHeaders: Record<string, string> = token
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" };

        const response = await fetch(
          `http://localhost:5050/api/reports/recent`,
          {
            method: "GET",
            headers: authHeaders,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // Implement search functionality
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <FinanceHeader userName={user?.firstName} />

      {/* Content Area */}
      <div className="p-8">
        {/* Download Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Download a report
          </h2>
          
          {/* Search Bar */}
          <div className="flex gap-3 max-w-md">
            <div className="flex-1 relative">
              <MagnifyingGlass
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Enter billing id"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary hover:bg-[#6886AC] text-white font-medium rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Recently Accessed Reports */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Recently accessed reports
            </h2>
            <p className="text-sm text-gray-500">View your reports below</p>
          </div>

          {/* Reports List */}
          <div className="space-y-4 max-w-2xl">
            {reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard
                  key={report._id}
                  reportId={report.reportId}
                  insuranceProvider={report.insuranceProvider}
                  description={report.description}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <p className="text-gray-500">No recent reports found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;