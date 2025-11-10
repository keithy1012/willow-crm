import React, { useEffect, useState } from "react";
import InvoiceCard from "components/card/InvoiceCard";
import FinanceHeader from "components/headers/FinanceHeader";
import { useRequireRole } from "hooks/useRequireRole";

interface Invoice {
  _id: string;
  doctorName: string;
  doctorUsername: string;
  appointmentType: string;
  appointmentDate: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useRequireRole("Finance", true);

  useEffect(() => {
    const fetchInvoices = async () => {
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
          `http://localhost:5050/api/patients/${user._id}/invoices`,
          {
            method: "GET",
            headers: authHeaders,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinanceHeader userName={user.firstName}/>

      {/* Content Area */}
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Patient Invoices
          </h1>
          <p className="text-sm text-gray-500">
            Look at recently viewed patient invoices below.
          </p>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <InvoiceCard
                key={invoice._id}
                doctorName={invoice.doctorName}
                doctorUsername={invoice.doctorUsername}
                appointmentType={invoice.appointmentType}
                appointmentDate={invoice.appointmentDate}
              />
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
                Nothing to do!
              </p>
              <p className="text-gray-500 text-sm mt-2">
                You have no invoices at the moment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invoices;