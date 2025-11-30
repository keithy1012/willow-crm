import React, { useEffect, useState } from "react";
import LargeMedicationCard from "components/card/LargeMedicationCard";
import { Info } from "phosphor-react";
import { medorderService } from "api/services/medorder.service";
import { MedorderResponse } from "api/types/medorder.types";
import toast from "react-hot-toast";
import { patientService } from "api/services/patient.service";

const Medications: React.FC = () => {
  const [medications, setMedications] = useState<MedorderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string>("");

  // Fetch patient ID
  useEffect(() => {
    const loadPatient = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const userParsed = JSON.parse(stored);

          try {
            const patient = await patientService.getById(userParsed._id);
            setPatientId(patient._id);
          } catch (err) {
            console.log("Direct patient fetch failed, searching by name...");
            const fullName = `${userParsed.firstName} ${userParsed.lastName}`;
            const searchResult = await patientService.searchByName(fullName);

            if (searchResult.patients && searchResult.patients.length > 0) {
              const patient = searchResult.patients[0];
              setPatientId(patient._id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load patient:", err);
        toast.error("Failed to load patient information");
      }
    };
    loadPatient();
  }, []);

  // Fetch medications
  useEffect(() => {
    const fetchMedications = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        const response = await medorderService.getMedordersByPatient(patientId);
        setMedications(response.medorders);
      } catch (error) {
        console.error("Error fetching medications:", error);
        toast.error("Failed to load medications");
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [patientId]);

  const handleRefillRequest = async (medicationId: string) => {
    try {
      const medication = medications.find(
        (med) => med.orderID === medicationId
      );
      if (!medication) return;

      // Send refill request email
      await fetch("http://localhost:5050/api/medorders/refill-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicationName: medication.medicationName,
          patientName: `${medication.patientID.name}`,
          patientEmail: medication.patientID.email,
          quantity: medication.quantity,
          pharmacy: "Willow CRM Pharmacy",
          lastRefillDate: medication.lastRefillDate,
        }),
      });

      toast.success("Refill request sent successfully!");

      // Refresh medications list
      const response = await medorderService.getMedordersByPatient(patientId);
      setMedications(response.medorders);
    } catch (error) {
      console.error("Error requesting refill:", error);
      toast.error("Failed to request refill. Please try again.");
    }
  };

  const handleDelete = async (medicationId: string) => {
    try {
      await medorderService.deleteMedorder(medicationId);
      toast.success("Medication deleted successfully");

      // Remove from local state
      setMedications((prev) =>
        prev.filter((med) => med.orderID !== medicationId)
      );
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast.error("Failed to delete medication. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-foreground">
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-semibold mb-8 text-gray-900">
          My Medications
        </h1>

        {medications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No medications found</p>
            <p className="text-gray-500 text-sm mt-2">
              Your prescribed medications will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((medication) => (
              <LargeMedicationCard
                key={medication.orderID}
                medicationId={medication.orderID}
                medicationName={medication.medicationName}
                medicationNotes={medication.instruction}
                lastRequested={
                  medication.lastRefillDate
                    ? new Date(medication.lastRefillDate)
                    : undefined
                }
                prescribedOn={new Date(medication.prescribedOn)}
                refillDetails={medication.quantity || "N/A"}
                pharmacyDetails="Willow CRM Pharmacy"
                onRefillRequest={handleRefillRequest}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Requesting a Refill
            </h2>
            <p className="text-gray-700 mb-4">
              When you tap "Request Refill," we'll send a refill request
              directly to the pharmacy listed for this medication.
            </p>

            <div className="space-y-3">
              <p className="text-gray-700">
                <span className="font-medium">Before requesting:</span>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
                <li>
                  Check that you have enough medication to last until the refill
                  is ready (typically 1-2 days)
                </li>
                <li>
                  Refill requests can usually be submitted when you have about 7
                  days of medication remaining
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-700">
              <span className="font-medium">Need a new prescription?</span> If
              your refill request is denied or you see "0 refills remaining,"
              contact your provider to get a new prescription written.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Info size={20} />
              Important Information
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                • Always follow the dosage instructions provided by your
                healthcare provider
              </p>
              <p>• Contact your doctor if you experience any side effects</p>
              <p>• Keep medications out of reach of children</p>
              <p>• Store medications as directed on the label</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Pharmacy:</span> (555) 123-4567
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Provider's Office:</span> (555)
                987-6543
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Emergency:</span> 911
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medications;
