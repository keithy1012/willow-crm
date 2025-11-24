import React, { useEffect, useState } from "react";
import InvoiceCard from "components/card/InvoiceCard";
import FinanceHeader from "components/headers/FinanceHeader";
import { useRequireRole } from "hooks/useRequireRole";
import PrimaryButton from "components/buttons/PrimaryButton";
import SmallSearchBar from "components/input/SmallSearchBar";
import CreateInvoiceModal from "components/modal/CreateInvoiceModal";
import InvoiceDetailsModal from "components/modal/InvoiceDetailsModal";
import { Funnel } from "phosphor-react";
import { financeService } from "api/services/finance.service";
import { Invoice, CreateInvoiceData } from "api/types/finance.types";

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [invoiceData, setInvoiceData] = useState<CreateInvoiceData>({
    patientId: "",
    doctorName: "",
    appointmentDate: "",
    amount: "",
    description: "",
  });
  const user = useRequireRole("Finance", true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await financeService.getAllInvoices();
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [searchQuery, statusFilter, invoices]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (text: string) => {
    setInvoiceData((prev) => ({ ...prev, description: text }));
  };

  const handlePatientSelect = (patientId: string, patientName: string) => {
    setInvoiceData((prev) => ({ 
      ...prev, 
      patientId,
    }));
  };

  const handleCreateInvoice = async () => {
    try {
      await financeService.createInvoice(invoiceData);

      // Reset form and close modal
      setInvoiceData({
        patientId: "",
        doctorName: "",
        appointmentDate: "",
        amount: "",
        description: "",
      });
      setIsCreateModalOpen(false);

      // Refresh invoices list
      const data = await financeService.getAllInvoices();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleSendToExternalSystem = async (invoiceId: string) => {
    try {
      await financeService.sendInvoiceToExternal(invoiceId);
      // Refresh invoices list
      const data = await financeService.getAllInvoices();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error("Error sending invoice:", error);
    }
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
    <div className="min-h-screen bg-gray-50">
      <FinanceHeader userName={user.firstName} />

      {/* Content Area */}
      <div className="p-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Patient Invoices
            </h1>
            <p className="text-sm text-gray-500">
              Look at recently viewed patient invoices below.
            </p>
          </div>
          <PrimaryButton
            text="Create Invoice"
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="medium"
            toggleable={false}
          />
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <SmallSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by patient or doctor name..."
              onClear={handleClearSearch}
            />
          </div>
          <div className="relative">
            <Funnel
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
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
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <PrimaryButton
                    text="View Details"
                    onClick={() => handleViewDetails(invoice)}
                    variant="outline"
                    size="small"
                    toggleable={false}
                  />
                  {invoice.status !== "sent" && invoice.status !== "paid" && (
                    <PrimaryButton
                      text="Send"
                      onClick={() => handleSendToExternalSystem(invoice._id)}
                      variant="primary"
                      size="small"
                      toggleable={false}
                    />
                  )}
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
                {searchQuery || statusFilter !== "all"
                  ? "No invoices found"
                  : "Nothing to do!"}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You have no invoices at the moment"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        invoiceData={invoiceData}
        onClose={() => setIsCreateModalOpen(false)}
        onFieldChange={handleFieldChange}
        onDescriptionChange={handleDescriptionChange}
        onCreate={handleCreateInvoice}
        onPatientSelect={handlePatientSelect}
      />

      <InvoiceDetailsModal
        isOpen={isDetailsModalOpen}
        invoice={selectedInvoice}
        onClose={handleCloseDetailsModal}
        onSend={handleSendToExternalSystem}
      />
    </div>
  );
};

export default Invoices;