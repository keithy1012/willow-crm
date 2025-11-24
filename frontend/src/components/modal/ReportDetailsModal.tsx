import React from "react";
import { FileText, DownloadSimple } from "phosphor-react";
import PrimaryButton from "components/buttons/PrimaryButton";
import { BillingReport } from "api/types/finance.types";

interface ReportDetailsModalProps {
  isOpen: boolean;
  report: BillingReport | null;
  onClose: () => void;
  onExport: (reportId: string, format: 'pdf' | 'csv' | 'xlsx') => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  isOpen,
  report,
  onClose,
  onExport,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full">
              <FileText size={20} weight="regular" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Report Details
            </h3>
          </div>
          <p className="text-sm text-gray-500">{report.reportId}</p>
        </div>

        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Report Type</p>
              <p className="text-base text-gray-800">{report.reportType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date Range</p>
              <p className="text-base text-gray-800">{report.dateRange}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Generated Date
              </p>
              <p className="text-base text-gray-800">{report.generatedDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-base text-gray-800 capitalize">
                {report.status || "Completed"}
              </p>
            </div>
          </div>

          {(report.totalRevenue ||
            report.outstandingReceivables ||
            report.paymentCollectionRate) && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Financial Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {report.totalRevenue !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      ${report.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                )}
                {report.outstandingReceivables !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Outstanding Receivables
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      ${report.outstandingReceivables.toLocaleString()}
                    </p>
                  </div>
                )}
                {report.paymentCollectionRate !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Collection Rate
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {report.paymentCollectionRate}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {report.summary && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Summary
              </h4>
              <p className="text-sm text-gray-600">{report.summary}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Export Report
          </h4>
          <div className="flex gap-3">
            <PrimaryButton
              text="PDF"
              onClick={() => onExport(report._id, "pdf")}
              variant="outline"
              size="small"
              toggleable={false}
            />
            <PrimaryButton
              text="CSV"
              onClick={() => onExport(report._id, "csv")}
              variant="outline"
              size="small"
              toggleable={false}
            />
            <PrimaryButton
              text="Excel"
              onClick={() => onExport(report._id, "xlsx")}
              variant="outline"
              size="small"
              toggleable={false}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <PrimaryButton
            text="Close"
            onClick={onClose}
            variant="outline"
            size="medium"
            toggleable={false}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;