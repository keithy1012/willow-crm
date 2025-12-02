import React, { useEffect, useState } from "react";
import InvoiceCard from "components/card/InvoiceCard";
import { useRequireRole } from "hooks/useRequireRole";
import { useAuth } from "contexts/AuthContext";
import PrimaryButton from "components/buttons/PrimaryButton";
import SmallSearchBar from "components/input/SmallSearchBar";
import CustomDropdown from "components/input/Dropdown";
import PatientInvoiceDetailsModal from "components/modal/PatientInvoiceDetailsModal";
import { financeService } from "api/services/finance.service";
import { patientService } from "api/services/patient.service";
import { Invoice } from "api/types/finance.types";

const ViewInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [patientId, setPatientId] = useState<string | null>(null);
  const user = useRequireRole("Patient", true);
  const { user: authUser } = useAuth();

  // First, get the patient document to get the patient ID
  useEffect(() => {
    const fetchPatient = async () => {
      if (!authUser?._id) {
        console.log("No authUser ID found");
        return;
      }

      try {
        const patientData = await patientService.getById(authUser._id);
        console.log("Patient data:", patientData);
        console.log("Patient ID:", patientData._id);
        setPatientId(patientData._id);
      } catch (error) {
        console.error("Error fetching patient:", error);
        setLoading(false);
      }
    };

    fetchPatient();
  }, [authUser]);

  // Then fetch invoices using the patient ID
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!patientId) return;

      console.log("Fetching invoices for patient ID:", patientId);

      try {
        const data = await financeService.getPatientInvoices(patientId);
        console.log("Invoices received:", data);
        console.log("Number of invoices:", data.length);
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [patientId]);

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((invoice) =>
        invoice.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "All Status") {
      filtered = filtered.filter(
        (invoice) => invoice.status === statusFilter.toLowerCase()
      );
    }

    setFilteredInvoices(filtered);
  }, [searchQuery, statusFilter, invoices]);

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foreground">
      {/* Content Area */}
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            My Invoices
          </h1>
          <p className="text-sm text-gray-500">
            View your medical invoices and billing statements
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <SmallSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by doctor name..."
              onClear={handleClearSearch}
            />
          </div>
          <div className="w-64">
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All Status", "Pending", "Sent", "Paid", "Overdue"]}
              placeholder="Filter by status"
            />
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <div key={invoice._id} className="relative">
                <InvoiceCard
                  doctorName={invoice.doctorName}
                  status={invoice.status}
                  appointmentDate={invoice.appointmentDate}
                  patientName={invoice.patientName}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <PrimaryButton
                    text="View Details"
                    onClick={() => handleViewDetails(invoice)}
                    variant="primary"
                    size="small"
                    toggleable={false}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              {/* Empty State Illustration */}
              <div className="relative w-64 h-64 mb-6">
                {/* Planet */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full">
                  {/* Planet ring */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-20 border-4 border-gray-300 rounded-full rotate-12"></div>
                </div>
                {/* Small planet */}
                <div className="absolute top-8 right-12 w-16 h-16 bg-gray-200 rounded-full"></div>
                {/* Stars */}
                <div className="absolute top-12 left-8 w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="absolute top-20 right-20 w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="absolute bottom-16 left-16 w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="absolute bottom-24 right-8 w-2 h-2 bg-gray-300 rounded-full"></div>
                {/* Hands */}
                <svg
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48"
                  viewBox="0 0 200 80"
                  fill="none"
                >
                  <path
                    d="M20 60 Q 40 40, 60 50 T 100 60"
                    stroke="#D1D5DB"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M180 60 Q 160 40, 140 50 T 100 60"
                    stroke="#D1D5DB"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </div>
              <p className="text-gray-800 font-medium text-lg">
                {searchQuery || statusFilter !== "All Status"
                  ? "No invoices found"
                  : "No invoices yet!"}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchQuery || statusFilter !== "All Status"
                  ? "Try adjusting your search or filters"
                  : "You don't have any invoices at the moment"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      <PatientInvoiceDetailsModal
        isOpen={isDetailsModalOpen}
        invoice={selectedInvoice}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
};

export default ViewInvoices;
