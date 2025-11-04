import React, { useState, FormEvent, ChangeEvent } from "react";
import LongTextArea from "../components/input/LongTextArea";
import PrimaryButton from "../components/buttons/PrimaryButton";

interface TicketPayload {
  title: string;
  content: string;
  status: string;
  isResolved: boolean;
  submitter: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
  ticket?: any;
}

const BugReport: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const submitterId = user?._id || user?.id || "";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!submitterId) {
      setMessage(" ERROR: Missing user ID — please log in again.");
      setLoading(false);
      return;
    }

    const payload: TicketPayload = {
      title,
      content,
      status: "Pending",
      isResolved: false,
      submitter: submitterId,
    };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5050/api/tickets/bugTicket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ticket");
      }

      setMessage("SUCCESS: Ticket submitted successfully!");
      setTitle("");
      setContent("");
    } catch (err: any) {
      setMessage(` ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
    };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md border">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Submit a Ticket
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Title Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={handleChange(setTitle)}
            placeholder="Brief summary of the issue"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <LongTextArea
            placeholder="Describe the problem or request in detail..."
            value={content}
            onChange={(text) => setContent(text)}
            button={false}
            minHeight={120}
            maxHeight={300}
          />
        </div>

        {/* Submit Button */}
        <PrimaryButton
          text={loading ? "Submitting..." : "Submit Ticket"}
          variant={"primary"}
          size={"medium"}
          type={"submit"}
          disabled={loading}
          className="w-full"
        />
      </form>

      {/* Feedback Message */}
      {message && (
        <p
          className={`mt-4 text-center ${
            message.startsWith("SUCCESS") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default BugReport;
