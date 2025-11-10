import React, { useEffect, useState } from "react";
import TicketCard from "../../components/card/TicketCard";
import ConfirmTicketModal from "../../components/modal/ConfirmTicketModal";
import FinishTicketModal from "../../components/modal/FinishTicketModal";
import { useRequireRole } from "../../hooks/useRequireRole";
import { ticketService } from "../../api";
import { PatientTicket } from "../../api/types/ticket.types";

const OpsPatientDashboard: React.FC = () => {
  const [pendingTickets, setPendingTickets] = useState<PatientTicket[]>([]);
  const [inProgressTickets, setInProgressTickets] = useState<PatientTicket[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<PatientTicket | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  const user = useRequireRole("Ops", true);

  const fetchTickets = async () => {
    if (!user?._id) return;

    try {
      const [pending, inProgress] = await Promise.all([
        ticketService.patient.getPending(),
        ticketService.patient.getInProgressByOpsId(user._id),
      ]);

      setPendingTickets(pending);
      setInProgressTickets(inProgress);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleAssignClick = (ticket: PatientTicket) => {
    setSelectedTicket(ticket);
    setIsConfirmModalOpen(true);
  };

  const handleFinishClick = (ticket: PatientTicket) => {
    setSelectedTicket(ticket);
    setIsFinishModalOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!selectedTicket) return;

    try {
      await ticketService.patient.start(selectedTicket._id);
      setIsConfirmModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error claiming ticket:", error);
    }
  };

  const handleFinishTicket = async () => {
    if (!selectedTicket) return;

    try {
      await ticketService.patient.complete(selectedTicket._id);
      setIsFinishModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
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
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-sm mb-2">Operations Dashboard</h2>
          <p className="text-sm">Manage patient change requests</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-8">
        <div className="flex-1 bg-foreground border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primaryText mb-4">
            All Patient Tickets
          </h2>
          <div className="space-y-4">
            {pendingTickets.length > 0 ? (
              pendingTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  title={ticket.ticketName}
                  requestedBy={ticket.patientName}
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

        <div className="flex-1 bg-foreground border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primaryText mb-4">
            In Progress
          </h2>
          <div className="space-y-4">
            {inProgressTickets.length > 0 ? (
              inProgressTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  title={ticket.ticketName}
                  requestedBy={ticket.patientName}
                  description={ticket.description}
                  buttonLabel="Finish"
                  onButtonClick={() => handleFinishClick(ticket)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No in-progress tickets found.
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmTicketModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmClaim}
        ticket={selectedTicket}
      />

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
