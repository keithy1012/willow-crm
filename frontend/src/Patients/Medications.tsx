

import React from "react";
import LargeMedicationCard from "components/card/LargeMedicationCard";
import { Info } from "phosphor-react";

interface Medication {
  id: string;
  name: string;
  notes: string;
  lastRequested: Date;
  prescribedOn: Date;
  refillDetails: string;
  pharmacyDetails: string;
}

const Medications: React.FC = () => {
  const medications: Medication[] = [
    {
      id: "1",
      name: "Name of Medication",
      notes:
        "Take this medication once a day by month. If taken late, take two in one day, but do not exceed three.",
      lastRequested: new Date("2025-03-10"),
      prescribedOn: new Date("2025-02-18"),
      refillDetails: "84 Tablets",
      pharmacyDetails: "This Hospital",
    },
    {
      id: "2",
      name: "Name of Medication",
      notes:
        "Take this medication once a day by month. If taken late, take two in one day, but do not exceed three.",
      lastRequested: new Date("2025-03-10"),
      prescribedOn: new Date("2025-02-18"),
      refillDetails: "84 Tablets",
      pharmacyDetails: "This Hospital",
    },
    {
      id: "3",
      name: "Name of Medication",
      notes:
        "Take this medication once a day by month. If taken late, take two in one day, but do not exceed three.",
      lastRequested: new Date("2025-03-10"),
      prescribedOn: new Date("2025-02-18"),
      refillDetails: "84 Tablets",
      pharmacyDetails: "This Hospital",
    },
  ];

  return (
    <div className="flex h-screen bg-foreground">
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-semibold mb-8 text-gray-900">
          My Medications
        </h1>

        <div className="space-y-4">
          {medications.map((medication) => (
            <LargeMedicationCard
              key={medication.id}
              medicationId={medication.id}
              medicationName={medication.name}
              medicationNotes={medication.notes}
              lastRequested={medication.lastRequested}
              prescribedOn={medication.prescribedOn}
              refillDetails={medication.refillDetails}
              pharmacyDetails={medication.pharmacyDetails}
            />
          ))}
        </div>
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
