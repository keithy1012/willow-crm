import React, { useState } from "react";
import { X, Pill } from "phosphor-react";
import PrimaryButton from "../buttons/PrimaryButton";
import LongTextArea from "../input/LongTextArea";

interface PrescribeMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientID: string;
  doctorID: string;
  onComplete: (data: any) => void;
}

const PrescribeMedicationModal: React.FC<PrescribeMedicationModalProps> = ({
  isOpen,
  onClose,
  patientName,
  patientID,
  doctorID,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    instructions: "",
    frequency: "",
    customFrequency: "",
    duration: "",
    customDuration: "",
    quantity: "",
    refills: "",
  });

  const totalSteps = 4;

  const frequencyOptions = [
    { id: "once-daily", name: "Once daily" },
    { id: "twice-daily", name: "Twice daily" },
    { id: "as-needed", name: "As Needed" },
  ];

  const durationOptions = [
    { id: "5-days", name: "5 days" },
    { id: "7-days", name: "7 days" },
    { id: "10-days", name: "10 Days" },
    { id: "14-days", name: "14 Days" },
    { id: "30-days", name: "30 Days" },
    { id: "90-days", name: "90 Days" },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Prepare data for submission
      const prescriptionData = {
        patientID,
        doctorID,
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        instruction: formData.instructions,
        recurringEvery: formData.customFrequency || formData.frequency,
        duration: formData.customDuration || formData.duration,
        quantity: formData.quantity,
        refillCount: parseInt(formData.refills) || 0,
        prescribedOn: new Date().toISOString(),
      };
      onComplete(prescriptionData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFrequencySelect = (frequencyId: string) => {
    setFormData({ ...formData, frequency: frequencyId, customFrequency: "" });
  };

  const handleDurationSelect = (durationId: string) => {
    setFormData({ ...formData, duration: durationId, customDuration: "" });
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.medicationName.trim() === "" ||
          formData.dosage.trim() === "" ||
          formData.instructions.trim() === ""
        );
      case 2:
        return (
          (formData.frequency === "" &&
            formData.customFrequency.trim() === "") ||
          (formData.duration === "" && formData.customDuration.trim() === "")
        );
      case 3:
        return (
          formData.quantity.trim() === "" || formData.refills.trim() === ""
        );
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  const getDisplayFrequency = () => {
    if (formData.customFrequency) return formData.customFrequency;
    const option = frequencyOptions.find(
      (opt) => opt.id === formData.frequency
    );
    return option ? option.name.toLowerCase() : "";
  };

  const getDisplayDuration = () => {
    if (formData.customDuration) return formData.customDuration;
    const option = durationOptions.find((opt) => opt.id === formData.duration);
    return option ? option.name : "";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-xl text-left text-primaryText mb-6">
              Provide some information on the Medication.
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-primaryText mb-2">
                  What is the medication name?
                </label>
                <input
                  type="text"
                  placeholder="Medication Name"
                  value={formData.medicationName}
                  onChange={(e) =>
                    setFormData({ ...formData, medicationName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className="text-primary">ⓘ</span> Please provide
                  official name
                </p>
              </div>

              <div>
                <label className="block text-sm text-primaryText mb-2">
                  What dosage should the patient take for this medication?
                </label>
                <input
                  type="text"
                  placeholder="Dosage"
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className="text-primary">ⓘ</span> Please provide
                  official dosage recommendation
                </p>
              </div>

              <div>
                <label className="block text-sm text-primaryText mb-2">
                  What are the instructions for taking the medication?
                </label>
                <textarea
                  placeholder="Medication Instructions..."
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-xl text-left text-primaryText mb-6">
              Provide some information on the frequency and duration.
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-primaryText mb-3">
                  What frequency should the patient take this medication?
                </label>
                <div className="flex gap-3 mb-3">
                  {frequencyOptions.map((option) => (
                    <PrimaryButton
                      key={option.id}
                      onClick={() => handleFrequencySelect(option.id)}
                      text={option.name}
                      variant="outline"
                      size="small"
                      controlled={true}
                      selected={formData.frequency === option.id}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or submit your own frequency..."
                  value={formData.customFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customFrequency: e.target.value,
                      frequency: "",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-primaryText mb-3">
                  What duration should the patient take this medication?
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {durationOptions.map((option) => (
                    <PrimaryButton
                      key={option.id}
                      onClick={() => handleDurationSelect(option.id)}
                      text={option.name}
                      variant="outline"
                      size="small"
                      controlled={true}
                      selected={formData.duration === option.id}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or submit your own duration..."
                  value={formData.customDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customDuration: e.target.value,
                      duration: "",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-xl text-left text-primaryText mb-6">
              Provide some information on the quantity and refills.
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-primaryText mb-2">
                  What is the quantity of medication you are prescribing?
                </label>
                <input
                  type="text"
                  placeholder="Medication quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-primaryText mb-2">
                  How many refills will the patient need?
                </label>
                <input
                  type="number"
                  placeholder="Refill amount"
                  value={formData.refills}
                  onChange={(e) =>
                    setFormData({ ...formData, refills: e.target.value })
                  }
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-xl text-left text-primaryText mb-6">
              Verify and Prescribe
            </h2>

            <div className="space-y-2 text-left text-primaryText">
              <p>
                <span className="font-semibold">Sig:</span> Take{" "}
                {formData.dosage} {getDisplayFrequency()}
              </p>
              <p>
                <span className="font-semibold">Duration:</span>{" "}
                {getDisplayDuration()}
              </p>
              <p>
                <span className="font-semibold">Quantity:</span>{" "}
                {formData.quantity}
              </p>
              <p>
                <span className="font-semibold">Refills:</span>{" "}
                {formData.refills} refill
                {parseInt(formData.refills) !== 1 ? "s" : ""}
              </p>
              <p>
                <span className="font-semibold">Instructions:</span>{" "}
                {formData.instructions}
              </p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Pill size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primaryText text-left">
                Prescribe a Medication
              </h1>
              <p className="text-secondaryText text-sm text-left">
                Prescribe a medication for {patientName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">{renderStepContent()}</div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between space-x-3 items-center mb-6">
            <PrimaryButton
              onClick={handleBack}
              text="Back"
              variant="outline"
              size="medium"
              className="w-full"
              controlled={true}
              selected={false}
              toggleable={false}
            />
            <PrimaryButton
              onClick={handleNext}
              text={currentStep === totalSteps ? "Send Prescription" : "Next"}
              variant="primary"
              size="medium"
              className="w-full"
              disabled={isNextDisabled()}
              controlled={true}
              selected={false}
              toggleable={false}
            />
          </div>

          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i + 1 === currentStep
                    ? "bg-primary w-6"
                    : i + 1 < currentStep
                    ? "bg-primary/50"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescribeMedicationModal;
