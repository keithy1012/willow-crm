import React, { useEffect, useState } from "react";
import TicketCard from "../../components/card/TicketCard";
import ConfirmTicketModal from "../../components/modal/ConfirmTicketModal";
import FinishTicketModal from "../../components/modal/FinishTicketModal";
import ApproveCreationModal from "../../components/modal/ApproveCreationModal";
import { useRequireRole } from "../../hooks/useRequireRole";
import { ticketService } from "../../api";
import {
  DoctorTicket,
  DoctorAccountCreationTicket,
} from "../../api/types/ticket.types";

const OpsDoctorDashboard: React.FC = () => {
  const [pendingTickets, setPendingTickets] = useState<DoctorTicket[]>([]);
  const [pendingDoctorCreationTickets, setPendingDoctorCreationTickets] =
    useState<DoctorAccountCreationTicket[]>([]);
  const [inProgressTickets, setInProgressTickets] = useState<DoctorTicket[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<
    DoctorTicket | DoctorAccountCreationTicket | null
  >(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  const user = useRequireRole("Ops", true);

  const fetchTickets = async () => {
    if (!user?._id) return;

    try {
      const [pending, inProgress, doctorCreationPending] = await Promise.all([
        ticketService.doctor.getPending(),
        ticketService.doctor.getInProgressByOpsId(user._id),
        ticketService.doctorCreation.getPending(),
      ]);

      setPendingTickets(pending);
      setInProgressTickets(inProgress);
      setPendingDoctorCreationTickets(doctorCreationPending);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleAssignClick = (ticket: DoctorTicket) => {
    setSelectedTicket(ticket);
    setIsConfirmModalOpen(true);
  };

  const handleApproveClick = (ticket: DoctorAccountCreationTicket) => {
    setSelectedTicket(ticket);
    setIsApproveModalOpen(true);
  };

  const handleFinishClick = (ticket: DoctorTicket) => {
    setSelectedTicket(ticket);
    setIsFinishModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedTicket) return;

    try {
      await ticketService.doctorCreation.approve((selectedTicket as any)._id);
      setIsApproveModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error approving doctor account ticket:", error);
    }
  };

  const handleConfirmClaim = async () => {
    if (!selectedTicket) return;

    try {
      await ticketService.doctor.start(selectedTicket._id);
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
      await ticketService.doctor.complete(selectedTicket._id);
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
          <p className="text-sm">Manage doctor change requests</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-8">
        <div className="flex-1 bg-foreground border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primaryText mb-4">
            All Doctor Tickets
          </h2>
          <div className="space-y-4">
            {pendingTickets.length > 0 ? (
              pendingTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  title={ticket.ticketName}
                  requestedBy={ticket.doctorName}
                  description={ticket.description}
                  buttonLabel="Assign"
                  onButtonClick={() => handleAssignClick(ticket)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No pending tickets found.</p>
            )}

            {/* Doctor Account Creation Tickets */}
            {pendingDoctorCreationTickets.length > 0 && (
              <>
                <h3 className="text-md font-medium text-primaryText mt-6">
                  Doctor Account Requests
                </h3>
                {pendingDoctorCreationTickets.map((ticket) => (
                  <TicketCard
                    key={(ticket as any)._id}
                    title={"Account Request"}
                    requestedBy={
                      (ticket as any).firstName + " " + (ticket as any).lastName
                    }
                    description={(ticket as any).description}
                    buttonLabel="Approve"
                    onButtonClick={() => handleApproveClick(ticket)}
                  />
                ))}
              </>
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
                  requestedBy={ticket.doctorName}
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
        ticket={selectedTicket as any}
      />

      {/* Approve modal for doctor account creation tickets */}
      <ApproveCreationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onApprove={handleApproveConfirm}
        ticket={selectedTicket as any}
      />

      <FinishTicketModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={handleFinishTicket}
        ticket={selectedTicket as any}
      />
    </div>
  );
};

export default OpsDoctorDashboard;
