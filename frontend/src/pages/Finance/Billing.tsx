import React, { useEffect, useState } from "react";
import ReportCard from "components/card/ReportCard";
import FinanceHeader from "components/headers/FinanceHeader";
import { useRequireRole } from "hooks/useRequireRole";
import PrimaryButton from "components/buttons/PrimaryButton";
import SmallSearchBar from "components/input/SmallSearchBar";
import ReportDetailsModal from "components/modal/ReportDetailsModal";
import GenerateReportModal from "components/modal/GenerateReportModal";
import { financeService } from "api/services/finance.service";
import { BillingReport } from "api/types/finance.types";

const Billing: React.FC = () => {
  const [reports, setReports] = useState<BillingReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<BillingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BillingReport | null>(null);
  const user = useRequireRole("Finance", true);

  const fetchReports = async () => {
    try {
      const data: BillingReport[] = await financeService.getRecentReports();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Auto-filter as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
      return;
    }

    const filtered = reports.filter(
      (report) =>
        report.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchQuery, reports]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleViewDetails = (report: BillingReport) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedReport(null);
  };

  const handleGenerateReport = async (
    reportType: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      await financeService.generateReport({
        reportType,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      });

      setIsGenerateModalOpen(false);
      
      // Refresh reports list
      await fetchReports();
      
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const handleExportReport = async (reportId: string, format: 'pdf' | 'csv' | 'xlsx') => {
    try {
      const blob = await financeService.exportReport(reportId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Error exporting report:", error);
    }
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
      <FinanceHeader userName={user?.firstName} />

      <div className="p-8">
        {/* Header with Generate Button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Billing and Reports
            </h2>
            <p className="text-sm text-gray-500">
              Generate and download financial reports
            </p>
          </div>
          <PrimaryButton
            text="Generate Report"
            onClick={() => setIsGenerateModalOpen(true)}
            variant="primary"
            size="medium"
            toggleable={false}
          />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md">
            <SmallSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Enter report id or type"
              onClear={handleClearSearch}
            />
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
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div key={report._id} className="relative">
                  <ReportCard
                    reportId={report.reportId}
                    reportType={report.reportType}
                    dateRange={report.dateRange}
                    generatedDate={report.generatedDate}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <PrimaryButton
                      text="View"
                      onClick={() => handleViewDetails(report)}
                      variant="primary"
                      size="small"
                      toggleable={false}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <p className="text-gray-500 mb-2">
                  {searchQuery
                    ? "No reports found matching your search"
                    : "No reports available"}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-gray-400">
                    Click "Generate Report" to create your first report
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReportDetailsModal
        isOpen={isDetailsModalOpen}
        report={selectedReport}
        onClose={handleCloseModal}
        onExport={handleExportReport}
      />

      <GenerateReportModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
};

export default Billing;