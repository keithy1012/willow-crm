import React, { useEffect, useState } from "react";
import { useAuth } from "contexts/AuthContext";
import { patientService } from "api/services/patient.service";
import { ticketService } from "api/services/ticket.service";

interface Patient {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
  };
  address: string;
  bloodtype: string;
  birthday: string;
  allergies: string[];
  medicalHistory: string[];
  emergencyContact?: { phoneNumber: string }[];
}

const PatientEditRequest: React.FC = () => {
  const { user: authUser } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!authUser?._id) return;
      setLoading(true);
      try {
        const data = await patientService.getById(authUser._id);
        const d: any = data;
        setPatient(d);

        // Resolve emergency contact phone whether populated or an ObjectId
        let emergencyPhone = "";
        const ec0 = d?.emergencyContact && d.emergencyContact[0];
        if (ec0) {
          if (typeof ec0 === "string") {
            emergencyPhone = ""; // id only
          } else if (typeof ec0 === "object") {
            emergencyPhone = ec0.phoneNumber || "";
          }
        }

        // Normalize arrays and fields
        const allergies = Array.isArray(d.allergies) ? d.allergies : [];
        const medicalHistory = Array.isArray(d.medicalHistory)
          ? d.medicalHistory
          : [];

        // Handle birthday as Date or string
        let birthdayIso = "";
        if (d && d.birthday) {
          if (typeof d.birthday === "string")
            birthdayIso = d.birthday.split("T")[0];
          else if (d.birthday instanceof Date)
            birthdayIso = d.birthday.toISOString().split("T")[0];
          else birthdayIso = new Date(d.birthday).toISOString().split("T")[0];
        }

        setFormData({
          fullName: `${(d.user as any)?.firstName || ""} ${
            (d.user as any)?.lastName || ""
          }`.trim(),
          gender: (d.user as any)?.gender || "",
          bloodtype: d.bloodtype || "",
          birthday: birthdayIso,
          phoneNumber: (d.user as any)?.phoneNumber || "",
          email: (d.user as any)?.email || "",
          address: d.address || "",
          emergencyContact: emergencyPhone,
          allergies,
          conditions: medicalHistory,
        });
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [authUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!formData) return;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: string, values: string[]) => {
    setFormData((prev: any) => ({ ...prev, [name]: values }));
  };

  const handleSubmit = async () => {
    if (!patient) return;

    // Generate the change summary
    const changes: string[] = [];
    const fields = [
      {
        key: "fullName",
        label: "Full Name",
        old: `${(patient as any)?.user?.firstName || ""} ${
          (patient as any)?.user?.lastName || ""
        }`.trim(),
      },
      {
        key: "gender",
        label: "Gender",
        old: (patient as any)?.user?.gender || "",
      },
      {
        key: "bloodtype",
        label: "Blood Type",
        old: (patient as any)?.bloodtype || "",
      },
      {
        key: "birthday",
        label: "Birthday",
        old: (patient as any)?.birthday || "",
      },
      {
        key: "phoneNumber",
        label: "Phone Number",
        old: (patient as any)?.user?.phoneNumber || "",
      },
      {
        key: "email",
        label: "Email",
        old: (patient as any)?.user?.email || "",
      },
      {
        key: "address",
        label: "Address",
        old: (patient as any)?.address || "",
      },
      {
        key: "emergencyContact",
        label: "Emergency Contact",
        old:
          ((patient as any)?.emergencyContact &&
            (patient as any).emergencyContact[0] &&
            ((patient as any).emergencyContact[0].phoneNumber || "")) ||
          "",
      },
      {
        key: "allergies",
        label: "Allergies",
        old: ((patient as any)?.allergies || []).join(", "),
      },
      {
        key: "conditions",
        label: "Conditions",
        old: ((patient as any)?.medicalHistory || []).join(", "),
      },
    ];

    fields.forEach(({ key, label, old }) => {
      const current = formData ? formData[key] : undefined;
      const newVal = Array.isArray(current) ? current.join(", ") : current;
      const oldSafe = old === undefined || old === null ? "" : String(old);
      if ((newVal || "") !== oldSafe)
        changes.push(
          `Change ${label} from "${oldSafe || "N/A"}" to "${newVal || "N/A"}"`
        );
    });

    if (changes.length === 0) {
      console.log("No changes detected.");
      return;
    }

    const content = changes.join(", ");

    try {
      await ticketService.patient.create({
        patientId: patient._id,
        content,
      } as any);
      console.log("Edit request submitted successfully.");
    } catch (err) {
      console.error("Error submitting edit request:", err);
    }
  };

  if (loading || !formData) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex flex-col w-full bg-[#f9f9f9] min-h-screen">
      <div className="h-40 bg-gradient-to-r from-gray-400 to-gray-600" />
      <div className="relative -mt-20 mx-auto w-[90%] max-w-6xl bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-6">User Editing Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="flex flex-col space-y-4">
            <img
              src={authUser?.profilePic || "https://placehold.co/120x120"}
              alt="Profile"
              className="w-28 h-28 rounded-lg object-cover mx-auto border"
            />
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="border rounded-md p-2"
            />
            <input
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="Gender"
              className="border rounded-md p-2"
            />
            <input
              name="bloodtype"
              value={formData.bloodtype}
              onChange={handleChange}
              placeholder="Blood Type"
              className="border rounded-md p-2"
            />
            <input
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              className="border rounded-md p-2"
            />
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="border rounded-md p-2"
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-4">
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border rounded-md p-2"
            />
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="border rounded-md p-2"
            />
            <input
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Emergency Contact"
              className="border rounded-md p-2"
            />

            {/* Allergies */}
            <textarea
              name="allergies"
              value={(formData.allergies || []).join(", ")}
              onChange={(e) =>
                handleArrayChange(
                  "allergies",
                  e.target.value.split(",").map((v) => v.trim())
                )
              }
              placeholder="Add allergies (comma separated)"
              className="border rounded-md p-2 h-20"
            />

            {/* Conditions */}
            <textarea
              name="conditions"
              value={(formData.conditions || []).join(", ")}
              onChange={(e) =>
                handleArrayChange(
                  "conditions",
                  e.target.value.split(",").map((v) => v.trim())
                )
              }
              placeholder="Add conditions (comma separated)"
              className="border rounded-md p-2 h-20"
            />

            <button
              onClick={handleSubmit}
              className="bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700"
            >
              Send Edit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientEditRequest;
