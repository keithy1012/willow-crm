import React, { useState } from "react";
import { X, FirstAid } from "phosphor-react";
import PrimaryButton from "../buttons/PrimaryButton";
import LongTextArea from "../input/LongTextArea";

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  appointmentTime: string;
  appointmentDate: string;
  onComplete: (data: any) => void;
}

const verificationImage = "/475.Positive-Vibes.png";

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  doctorName,
  appointmentTime,
  appointmentDate,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isEmergency, setIsEmergency] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    duration: "",
    newOrOngoing: "",
    symptoms: [] as string[],
    notes: "",
  });

  const totalSteps = 5;

  const symptomTimes = [
    { id: "today", name: "Today" },
    { id: "1-3days", name: "1-3 Days" },
    { id: "1week", name: "1 Week" },
    { id: "1month", name: "1 Month" },
    { id: "longer", name: "Longer" },
  ];

  const commonSymptoms = [
    { id: "fever", name: "Fever? (Temperature if known)" },
    { id: "nausea", name: "Nausea or vomiting?" },
    { id: "dizziness", name: "Dizziness or lightheadedness?" },
    { id: "injury", name: "Recent injury or trauma?" },
    { id: "skin", name: "Rash or skin changes?" },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        ...formData,
        isEmergency,
        doctorName,
        appointmentTime,
        appointmentDate,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter((id) => id !== symptomId)
        : [...prev.symptoms, symptomId],
    }));
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return isEmergency === null || isEmergency === true;
      case 2:
        return formData.duration === "" || formData.newOrOngoing === "";
      case 3:
        return formData.symptoms.length === 0;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-xl text-left text-primaryText mb-6">
              First, we need some information.
            </h2>
            <p className="text-sm text-left text-primaryText mb-4">
              Is this a life threatening emergency? Do you feel...
              <span className="text-error ml-1">*</span>
            </p>
            <ul className="list-disc text-sm text-left list-inside space-y-2 text-primaryText mb-6">
              <li>Chest pain or pressure?</li>
              <li>Difficulty breathing or shortness of breath?</li>
              <li>Severe bleeding that won't stop?</li>
              <li>Loss of consciousness or confusion?</li>
              <li>
                Signs of stroke (face drooping, arm weakness, speech
                difficulty)?
              </li>
              <li>Severe allergic reaction?</li>
              <li>Thoughts of self-harm?</li>
            </ul>
            <div className="flex gap-4 justify-center">
              <div className="flex gap-4 justify-center">
                <PrimaryButton
                  onClick={() => setIsEmergency(false)}
                  text="No"
                  variant="outline"
                  size="small"
                  controlled={true}
                  selected={isEmergency === false}
                />
                <PrimaryButton
                  onClick={() => setIsEmergency(true)}
                  text="Yes"
                  variant="outline"
                  size="small"
                  controlled={true}
                  selected={isEmergency === true}
                />
              </div>
            </div>
            {isEmergency === true && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-error font-medium">
                  Please call 911 or go to your nearest emergency room
                  immediately.
                </p>
                <p className="text-error text-sm mt-2">
                  This booking system is not for emergency situations.
                </p>
              </div>
            )}
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-xl text-primaryText text-left mb-6">
              Symptom Assessment
            </h2>
            <p className="text-sm text-left text-primaryText mb-4">
              When did symptoms start?
              <span className="text-error ml-1">*</span>
            </p>
            <div className="space-y-2 mb-6">
              {symptomTimes.map((time) => (
                <label
                  key={time.id}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="duration"
                    value={time.id}
                    checked={formData.duration === time.id}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="form-radio text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-primaryText">
                    {time.name}
                  </span>
                </label>
              ))}
            </div>

            <p className="text-sm text-left text-primaryText mb-4">
              Is this a new problem or ongoing condition?
              <span className="text-error ml-1">*</span>
            </p>
            <div className="flex gap-4">
              <div className="flex gap-4">
                <PrimaryButton
                  text="New Problem"
                  variant="outline"
                  size="small"
                  onClick={() =>
                    setFormData({ ...formData, newOrOngoing: "new" })
                  }
                  className="flex-1"
                  controlled={true}
                  selected={formData.newOrOngoing === "new"}
                />
                <PrimaryButton
                  text="Ongoing Condition"
                  variant="outline"
                  size="small"
                  onClick={() =>
                    setFormData({ ...formData, newOrOngoing: "ongoing" })
                  }
                  className="flex-1"
                  controlled={true}
                  selected={formData.newOrOngoing === "ongoing"}
                />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-xl text-primaryText text-left mb-6">
              Associated Symptoms
            </h2>
            <p className="text-sm text-left text-primaryText mb-4">
              What symptoms have you been experiencing?
              <span className="text-error ml-1">*</span>
            </p>
            <div className="space-y-2">
              {commonSymptoms.map((symptom) => (
                <label
                  key={symptom.id}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={symptom.id}
                    checked={formData.symptoms.includes(symptom.id)}
                    onChange={() => handleSymptomToggle(symptom.id)}
                    className="form-checkbox text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-primaryText">
                    {symptom.name}
                  </span>
                </label>
              ))}
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-xl text-primaryText text-left mb-6">
              Tell Us More
            </h2>
            <p className="text-sm text-left text-primaryText mb-4">
              Do you have any additional information?
            </p>
            <LongTextArea
              button={false}
              placeholder="Add additional information here..."
              buttonText=""
              value={formData.notes}
              onChange={(text) => setFormData({ ...formData, notes: text })}
            />
          </>
        );
      case 5:
        return (
          <>
            <h2 className="text-xl text-primaryText text-left mb-6">
              Verify and Schedule
            </h2>
            <p className="text-sm text-left text-primaryText mb-4">
              Confirm appointment for {doctorName} at {appointmentTime} on{" "}
              {appointmentDate}.
            </p>
            <div className="flex justify-center">
              <img
                src={verificationImage}
                alt="Confirmation"
                className="w-1/2"
              />
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
              <FirstAid size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primaryText text-left">
                Appointment Booking
              </h1>
              <p className="text-secondaryText text-sm text-left">
                Book an Appointment for {appointmentTime} on {appointmentDate}
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
              text={currentStep === totalSteps ? "Complete Booking" : "Next"}
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

export default AppointmentBookingModal;
