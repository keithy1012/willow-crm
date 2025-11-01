import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketHistoryTable from "components/table/ticketsHistoryTable";
interface Ticket {
  _id: string;
  ticketName: string;
  description: string;
  requestedByName: string;
  requestedByType: "Doctor" | "Patient";
  createdAt: string;
  dateCompleted: string;
}

const OpsHistory: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user?._id;

  useEffect(() => {
    if (!user || user.role !== "Ops") {
      navigate("/error");
      return;
    }

    if (!userID) return;

    const fetchTickets = async () => {
      try {
        const token = user?.token || localStorage.getItem("token") || "";
        const headers: Record<string, string> = token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" };

        const [doctorRes, patientRes] = await Promise.all([
          fetch(`http://localhost:5050/api/tickets/doctorChange/${userID}/all`, {
            method: "GET",
            headers,
          }),
          fetch(`http://localhost:5050/api/tickets/patientChange/${userID}/all`, {
            method: "GET",
            headers,
          }),
        ]);

        if (!doctorRes.ok || !patientRes.ok) throw new Error("Failed to fetch tickets");

        const doctorData = await doctorRes.json();
        const patientData = await patientRes.json();

        const combined = [
          ...doctorData.map((t: any) => ({
            ...t,
            requestedByName: t.doctorName,
            requestedByType: "Doctor",
          })),
          ...patientData.map((t: any) => ({
            ...t,
            requestedByName: t.patientName,
            requestedByType: "Patient",
          })),
        ];

        // Sort by completion date descending
        combined.sort(
          (a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime()
        );

        setTickets(combined);
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
        Loading history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
        <div className="text-left mb-6">
          <h1 className="text-2xl font-semibold">Hello, {user?.firstName || "Ops"}</h1>
        </div>
      </div>

      <div className="px-8 py-10">
            <h2 className="text-lg font-medium mb-6 text-gray-700">Your Ticket History</h2>
            <TicketHistoryTable tickets={tickets} />
            </div>
    </div>
  );
};

export default OpsHistory;
