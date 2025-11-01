import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketCard from "../components/card/TicketCard";
import ConfirmTicketModal from "components/modal/ConfirmTicketModal";
import FinishTicketModal from "components/modal/FinishTicketModal";

interface Ticket {
  _id: string;
  title: string;
  doctorName: string;
  description: string;
}

const OpsPatientDashboard: React.FC = () => {
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [inProgressTickets, setInProgressTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user?._id;

  // Fetch tickets
  useEffect(() => {
    if (!user || user.role !== "Ops") {
      navigate("/error");
      return;
    }

    if (!userID) return;

    const fetchTickets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = user?.token || localStorage.getItem("token") || "";

        const authHeaders: Record<string, string> = token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" };

        const [pendingRes, inProgressRes] = await Promise.all([
          fetch("http://localhost:5050/api/tickets/patientChange/pending", {
            method: "GET",
            headers: authHeaders,
          }),
          fetch(`http://localhost:5050/api/tickets/patientChange/${user._id}/inprogress`, {
            method: "GET",
            headers: authHeaders,
          }),
        ]);

        if (!pendingRes.ok || !inProgressRes.ok) {
          throw new Error("Failed to fetch tickets");
        }

        const pendingData = await pendingRes.json();
        const inProgressData = await inProgressRes.json();

        setPendingTickets(pendingData);
        setInProgressTickets(inProgressData);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userID, navigate, user]);

  // Handle "Assign" (confirm modal)
  const handleAssignClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsConfirmModalOpen(true);
  };

  // Handle "Finish" (finish modal)
  const handleFinishClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFinishModalOpen(true);
  };

  // Confirm claim (start ticket)
  const handleConfirmClaim = async () => {
    if (!selectedTicket) return;

    try {
      const token = user?.token || localStorage.getItem("token") || "";
      await fetch(`http://localhost:5050/api/tickets/patientChange/${selectedTicket._id}/start`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ claimedBy: user._id }),
      });

      setIsConfirmModalOpen(false);
      setSelectedTicket(null);
      window.location.reload();
    } catch (error) {
      console.error("Error claiming ticket:", error);
    }
  };

  // Finish ticket (mark completed)
  const handleFinishTicket = async () => {
    if (!selectedTicket) return;

    try {
      const token = user?.token || localStorage.getItem("token") || "";
      await fetch(`http://localhost:5050/api/tickets/patientChange/${selectedTicket._id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ finishedBy: user._id }),
      });

      setIsFinishModalOpen(false);
      setSelectedTicket(null);
      window.location.reload();
    } catch (error) {
      console.error("Error finishing ticket:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading tickets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-sm mb-2">Operations Dashboard</h2>
          <p className="text-sm">Manage and assign tickets for operations</p>
        </div>
      </div>

      {/* Columns */}
      <div className="flex flex-col lg:flex-row gap-8 p-8 bg-gray-50 min-h-screen">
        {/* Left column - Pending */}
        <div className="flex-1 bg-foreground border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primaryText mb-4">All Patient Tickets</h2>
          <div className="space-y-4">
            {pendingTickets.length > 0 ? (
              pendingTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  title={ticket.title}
                  requestedBy={ticket.doctorName}
                  description={ticket.description}
                  buttonLabel="Assign"
                  onButtonClick={() => handleAssignClick(ticket)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No pending tickets found.</p>
            )}
          </div>
        </div>

        {/* Right column - In Progress */}
        <div className="flex-1 bg-foreground border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primaryText mb-4">In Progress</h2>
          <div className="space-y-4">
            {inProgressTickets.length > 0 ? (
              inProgressTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  title={ticket.title}
                  requestedBy={ticket.doctorName}
                  description={ticket.description}
                  buttonLabel="Finish"
                  onButtonClick={() => handleFinishClick(ticket)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No in-progress tickets found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Assign Modal */}
      <ConfirmTicketModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmClaim}
        ticket={selectedTicket}
      />

      {/* Finish Ticket Modal */}
      <FinishTicketModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={handleFinishTicket}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default OpsPatientDashboard;
