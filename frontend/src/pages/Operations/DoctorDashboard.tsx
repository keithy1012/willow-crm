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

// Union type for both ticket types
type AnyDoctorTicket = DoctorTicket | DoctorAccountCreationTicket;

const OpsDoctorDashboard: React.FC = () => {
  const [pendingChangeTickets, setPendingChangeTickets] = useState<
    DoctorTicket[]
  >([]);
  const [pendingCreationTickets, setPendingCreationTickets] = useState<
    DoctorAccountCreationTicket[]
  >([]);
  const [inProgressTickets, setInProgressTickets] = useState<DoctorTicket[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<AnyDoctorTicket | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  const user = useRequireRole("Ops", true);

  const fetchTickets = async () => {
    if (!user?._id) return;

    try {
      const [changesPending, creationPending, changesInProgress] =
        await Promise.all([
          ticketService.doctor.getPending(),
          ticketService.doctorCreation.getPending(),
          ticketService.doctor.getInProgressByOpsId(user._id),
        ]);

      setPendingChangeTickets(changesPending);
      setPendingCreationTickets(creationPending);
      setInProgressTickets(changesInProgress);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const isDoctorTicket = (ticket: AnyDoctorTicket): ticket is DoctorTicket => {
    return "doctorName" in ticket;
  };

  const isCreationTicket = (
    ticket: AnyDoctorTicket
  ): ticket is DoctorAccountCreationTicket => {
    return (
      "firstName" in ticket && "lastName" in ticket && "speciality" in ticket
    );
  };

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

  const handleConfirmClaim = async () => {
    if (!selectedTicket || !isDoctorTicket(selectedTicket)) return;

    try {
      await ticketService.doctor.start(selectedTicket._id);
      setIsConfirmModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error claiming ticket:", error);
    }
  };

  const handleApproveCreation = async () => {
    if (!selectedTicket || !isCreationTicket(selectedTicket)) return;

    try {
      await ticketService.doctorCreation.approve(selectedTicket._id);
      setIsApproveModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error approving doctor creation:", error);
    }
  };

  const handleFinishTicket = async () => {
    if (!selectedTicket || !isDoctorTicket(selectedTicket)) return;

    try {
      await ticketService.doctor.complete(selectedTicket._id);
      setIsFinishModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error finishing ticket:", error);
    }
  };

  // Transform DoctorAccountCreationTicket to match modal expectations
  const transformCreationTicketForModal = (
    ticket: DoctorAccountCreationTicket
  ) => {
    return {
      ...ticket,
      ticketName: `New Doctor Account: Dr. ${ticket.firstName} ${ticket.lastName}`,
      description: `Speciality: ${ticket.speciality} | Education: ${ticket.education} | Email: ${ticket.email}`,
      doctorName: `${ticket.firstName} ${ticket.lastName}`,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading tickets...
      </div>
    );
  }

  // Combine all pending tickets for display
  const allPendingTickets = [
    ...pendingChangeTickets.map((ticket) => ({
      ...ticket,
      type: "change" as const,
    })),
    ...pendingCreationTickets.map((ticket) => ({
      ...ticket,
      type: "creation" as const,
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-sm mb-2">Operations Dashboard</h2>
          <p className="text-sm">Manage doctor accounts and change requests</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-8">
        <div className="flex-1 bg-foreground border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primaryText mb-4">
            All Doctor Tickets
          </h2>
          <div className="space-y-4">
            {allPendingTickets.length > 0 ? (
              allPendingTickets.map((ticket) => {
                if (ticket.type === "change") {
                  const changeTicket = ticket as DoctorTicket;
                  return (
                    <TicketCard
                      key={changeTicket._id}
                      title={`Change Request: ${changeTicket.ticketName}`}
                      requestedBy={changeTicket.doctorName}
                      description={changeTicket.description}
                      buttonLabel="Assign"
                      onButtonClick={() => handleAssignClick(changeTicket)}
                    />
                  );
                } else {
                  const creationTicket = ticket as DoctorAccountCreationTicket;
                  return (
                    <TicketCard
                      key={creationTicket._id}
                      title={`New Account: Dr. ${creationTicket.firstName} ${creationTicket.lastName}`}
                      requestedBy={`${creationTicket.firstName} ${creationTicket.lastName}`}
                      description={`Speciality: ${creationTicket.speciality} | Education: ${creationTicket.education}`}
                      buttonLabel="Review & Approve"
                      onButtonClick={() => handleApproveClick(creationTicket)}
                    />
                  );
                }
              })
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

      {/* Modals remain the same */}
      <ConfirmTicketModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmClaim}
        ticket={
          selectedTicket && isDoctorTicket(selectedTicket)
            ? selectedTicket
            : null
        }
      />

      <FinishTicketModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={handleFinishTicket}
        ticket={
          selectedTicket && isDoctorTicket(selectedTicket)
            ? selectedTicket
            : null
        }
      />

      <ApproveCreationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onApprove={handleApproveCreation}
        ticket={
          selectedTicket && isCreationTicket(selectedTicket)
            ? transformCreationTicketForModal(selectedTicket)
            : null
        }
      />
    </div>
  );
};

export default OpsDoctorDashboard;
