import React from "react";

interface Ticket {
_id: string;
ticketName: string;
description: string;
requestedByName: string;
requestedByType: "Doctor" | "Patient";
createdAt: string;
dateCompleted: string;
}

interface TicketModalProps {
ticket: Ticket | null;
onClose: () => void;
}

const TicketHistoryModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
if (!ticket) return null;

return ( <div
   className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
   onClick={onClose}
 >
<div
className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-lg relative"
onClick={(e) => e.stopPropagation()} 
> <button
       className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
       onClick={onClose}
     >
× </button> <h2 className="text-xl font-bold mb-4">Ticket Details</h2> <p><strong>ID:</strong> {ticket._id}</p> <p><strong>Title:</strong> {ticket.ticketName}</p> <p><strong>Requester:</strong> {ticket.requestedByName}</p> <p><strong>Type:</strong> {ticket.requestedByType}</p> <p><strong>Date Requested:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p> <p><strong>Date Completed:</strong> {new Date(ticket.dateCompleted).toLocaleDateString()}</p> <p><strong>Description:</strong> {ticket.description}</p> </div> </div>
);
};

export default TicketHistoryModal;
