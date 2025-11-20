import React, { useEffect, useState } from "react";
import { FileText } from "phosphor-react";
import Field from "components/input/Field";
import LongTextArea from "components/input/LongTextArea";
import PrimaryButton from "components/buttons/PrimaryButton";
import SmallSearchBar from "components/input/SmallSearchBar";
import { CreateInvoiceData } from "api/types/finance.types";
import { patientService } from "api/services/patient.service";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  invoiceData: CreateInvoiceData;
  onClose: () => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (text: string) => void;
  onCreate: () => void;
  onPatientSelect: (patientId: string, patientName: string) => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  invoiceData,
  onClose,
  onFieldChange,
  onDescriptionChange,
  onCreate,
  onPatientSelect,
}) => {
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState("");

  useEffect(() => {
    if (patientSearch.length > 0) {
      searchPatients();
    } else {
      setPatients([]);
      setShowPatientDropdown(false);
    }
  }, [patientSearch]);

  const searchPatients = async () => {
    try {
      const results = await patientService.searchByName(patientSearch);
      setPatients(results.patients || []);
      setShowPatientDropdown(true);
    } catch (error) {
      console.error("Error searching patients:", error);
    }
  };

  const handlePatientSelect = (patient: any) => {
    const fullName = `${patient.user.firstName} ${patient.user.lastName}`;
    setSelectedPatientName(fullName);
    setPatientSearch(fullName);
    setShowPatientDropdown(false);
    onPatientSelect(patient._id, fullName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full">
              <FileText size={20} weight="regular" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Create Invoice
            </h3>
          </div>
          <p className="text-sm text-gray-500">
            Enter details to create a new patient invoice
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {/* Patient Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <SmallSearchBar
              value={patientSearch}
              onChange={setPatientSearch}
              placeholder="Search for a patient..."
              onClear={() => {
                setPatientSearch("");
                setSelectedPatientName("");
                onPatientSelect("", "");
              }}
            />

            {/* Patient Dropdown */}
            {showPatientDropdown && patients.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {patients.map((patient) => (
                  <button
                    key={patient._id}
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full text-left px-4 py-2 hover:bg-primary hover:text-white transition-colors text-sm"
                  >
                    {patient.user.firstName} {patient.user.lastName}
                    <span className="text-xs text-gray-500 ml-2">
                      ({patient.user.email})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Name
            </label>
            <Field
              placeholder="Dr. Smith"
              type="text"
              value={invoiceData.doctorName}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: { ...e.target, name: "doctorName" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFieldChange(event);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date
            </label>
            <Field
              placeholder="2025-01-15"
              type="date"
              value={invoiceData.appointmentDate}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: { ...e.target, name: "appointmentDate" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFieldChange(event);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <Field
              placeholder="250.00"
              type="number"
              value={invoiceData.amount}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: { ...e.target, name: "amount" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFieldChange(event);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <LongTextArea
              placeholder="Additional notes or service details..."
              value={invoiceData.description}
              onChange={onDescriptionChange}
              button={false}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <PrimaryButton
            text="Cancel"
            onClick={onClose}
            variant="outline"
            size="medium"
            toggleable={false}
            className="flex-1"
          />
          <PrimaryButton
            text="Create"
            onClick={onCreate}
            variant="primary"
            size="medium"
            toggleable={false}
            className="flex-1"
            disabled={!invoiceData.patientId}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;