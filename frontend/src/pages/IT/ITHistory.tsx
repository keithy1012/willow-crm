import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketHistoryTable from "components/table/ticketsHistoryTable";
import { useRequireRole } from "hooks/useRequireRole";
import { ticketService } from "api";
interface Ticket {
  _id: string;
  ticketName: string;
  description: string;
  requestedByName: string;
  requestedByType: "Doctor" | "Patient";
  createdAt: string;
  dateCompleted: string;
}

const ITHistory: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useRequireRole("IT", true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = user?.token || localStorage.getItem("token") || "";
        const headers: Record<string, string> = token
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" };

        const data = await ticketService.bug.getAllByItId(user._id);

        const combined = [
          ...data.map((t: any) => ({
            ...t,
            requestedByName: t.requestedBy,
            requestedByType: t.requestedByType,
          })),
        ];

        // Sort by completion date descending
        combined.sort(
          (a, b) =>
            new Date(b.dateCompleted).getTime() -
            new Date(a.dateCompleted).getTime()
        );

        setTickets(combined);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
        <div className="text-left mb-6">
          <h1 className="text-2xl font-semibold">
            Hello, {user?.firstName || "IT"}
          </h1>
        </div>
      </div>

      <div className="px-8 py-10">
        <h2 className="text-lg font-medium mb-6 text-gray-700">
          Your Ticket History
        </h2>
        <TicketHistoryTable tickets={tickets} />
      </div>
    </div>
  );
};

export default ITHistory;
