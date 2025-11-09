import React, { useState } from "react";
import TicketHistoryModal from "components/modal/TicketHistoryModal";

interface Ticket {
  _id: string;
  ticketName: string;
  description: string;
  requestedByName: string;
  requestedByType: "Doctor" | "Patient";
  createdAt: string;
  dateCompleted: string;
}

interface TicketHistoryTableProps {
  tickets: Ticket[];
}

const TicketHistoryTable: React.FC<TicketHistoryTableProps> = ({ tickets }) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const openModal = (ticket: Ticket) => setSelectedTicket(ticket);
  const closeModal = () => setSelectedTicket(null);

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md">
      {" "}
      <table className="min-w-full text-left text-sm text-gray-600">
        {" "}
        <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
          {" "}
          <tr>
            {" "}
            <th className="py-3 px-6">Ticket ID</th>{" "}
            <th className="py-3 px-6">Requester</th>{" "}
            <th className="py-3 px-6">Type</th>{" "}
            <th className="py-3 px-6">Date Requested</th>{" "}
            <th className="py-3 px-6">Date Completed</th>{" "}
            <th className="py-3 px-6">Description</th>{" "}
          </tr>{" "}
        </thead>{" "}
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <tr
                key={ticket._id}
                className="border-t hover:bg-gray-50 transition duration-150"
              >
                <td
                  className="py-3 px-6 font-medium text-blue-600 cursor-pointer hover:underline"
                  onClick={() => openModal(ticket)}
                >
                  {ticket._id}{" "}
                </td>{" "}
                <td className="py-3 px-6">
                  {ticket.requestedByName || "Unknown"}
                </td>{" "}
                <td className="py-3 px-6">{ticket.requestedByType}</td>{" "}
                <td className="py-3 px-6">
                  {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                </td>{" "}
                <td className="py-3 px-6">
                  {new Date(ticket.dateCompleted).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                </td>{" "}
                <td className="py-3 px-6 truncate max-w-[300px]">
                  {ticket.description}{" "}
                </td>{" "}
              </tr>
            ))
          ) : (
            <tr>
              {" "}
              <td colSpan={6} className="text-center text-gray-500 py-6 italic">
                No completed tickets found.{" "}
              </td>{" "}
            </tr>
          )}{" "}
        </tbody>{" "}
      </table>
      <TicketHistoryModal ticket={selectedTicket} onClose={closeModal} />
    </div>
  );
};

export default TicketHistoryTable;
