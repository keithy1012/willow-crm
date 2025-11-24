import React, { useEffect, useState } from "react";
import TicketHistoryTable from "../../components/table/ticketsHistoryTable";
import { useRequireRole } from "../../hooks/useRequireRole";
import { ticketService } from "../../api";

interface EnrichedTicket {
  _id: string;
  ticketName: string;
  description: string;
  requestedByName: string;
  requestedByType: "Doctor" | "Patient" | "DoctorCreation";
  createdAt: string;
  dateCompleted: string;
}

const OpsHistory: React.FC = () => {
  const [tickets, setTickets] = useState<EnrichedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useRequireRole("Ops", true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?._id) return;

      try {
        const [doctorTickets, patientTickets, doctorCreationCompleted] =
          await Promise.all([
            ticketService.doctor.getAllByOpsId(user._id),
            ticketService.patient.getAllByOpsId(user._id),
            ticketService.doctorCreation.getCompletedByUserId(user._id),
          ]);

        const combined: EnrichedTicket[] = [
          ...doctorTickets.map((t: any) => ({
            ...t,
            requestedByName: t.doctorName,
            requestedByType: "Doctor" as const,
          })),
          ...patientTickets.map((t: any) => ({
            ...t,
            requestedByName: t.patientName,
            requestedByType: "Patient" as const,
          })),

          ...doctorCreationCompleted.map((t: any) => ({
            _id: t._id,
            ticketName: "Doctor Account Creation",
            description: t.notes,
            requestedByName: `${t.firstName || ""} ${t.lastName || ""}`.trim(),
            requestedByType: "DoctorCreation" as const,
            createdAt: t.createdAt,
            dateCompleted: t.updatedAt,
          })),
        ];

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
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
        <h1 className="text-2xl font-semibold">
          Hello, {user?.firstName || "Ops"}
        </h1>
      </div>
      <div className="px-8 py-10">
        <h2 className="text-lg font-medium mb-6 text-gray-700">
          Your Ticket History
        </h2>
        <TicketHistoryTable tickets={tickets as any} />
      </div>
    </div>
  );
};

export default OpsHistory;
