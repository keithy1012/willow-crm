import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketCard from "../components/card/TicketCard";

interface Ticket {
  _id: string;
  title: string;
  requestedByID: string;
  description: string;
}

const OpsDashboard: React.FC = () => {
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [inProgressTickets, setInProgressTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user?._id; // user._id from login response

  useEffect(() => {
    if (!user || user.role !== "Ops") {
      navigate("/error"); // or any error/unauthorized page
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
          fetch("http://localhost:5050/api/tickets/doctorChange/pending", {
            method: "GET",
            headers: authHeaders,
          }),
          fetch(`http://localhost:5050/api/tickets/doctorChange/${user._id}/inprogress`, {
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
          <p className="text-sm">Manage and assign tickets for operations</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-8 bg-gray-50 min-h-screen">
        {/* Left column - Pending tickets */}
        <div className="flex-1 bg-foreground border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primaryText mb-4">
            All Tickets
          </h2>
          <div className="space-y-4">
            {pendingTickets.length > 0 ? (
              pendingTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  title={ticket.title}
                  requestedBy={ticket.requestedByID}
                  description={ticket.description}
                  buttonLabel="Assign"
                  onButtonClick={() => console.log("Assign", ticket._id)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No pending tickets found.</p>
            )}
          </div>
        </div>

        {/* Right column - In Progress tickets */}
        <div className="flex-1 bg-foreground border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primaryText mb-4">
            In Progress
          </h2>
          <div className="space-y-4">
            {inProgressTickets.length > 0 ? (
              inProgressTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  title={ticket.title}
                  requestedBy={ticket.requestedByID}
                  description={ticket.description}
                  buttonLabel="View"
                  onButtonClick={() => console.log("View", ticket._id)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No in-progress tickets found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpsDashboard;
