import React, { useState, FormEvent } from "react";
import LongTextArea from "../../components/input/LongTextArea";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { ticketService } from "../../api";
import { authService } from "../../api";

const BugReport: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const user = authService.getCurrentUser();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!user?._id) {
      setMessage("ERROR: Please log in again.");
      setLoading(false);
      return;
    }

    try {
      await ticketService.bug.create({
        title,
        content,
        status: "Pending",
        isResolved: false,
        submitter: user._id,
      });

      setMessage("SUCCESS: Ticket submitted successfully!");
      setTitle("");
      setContent("");
    } catch (err: any) {
      setMessage(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center items-center min-h-screen bg-gray-50 align-middle">
      <div className="w-1/2 mx-auto p-6 bg-white rounded-2xl shadow-md border">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Submit a Bug Report
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <LongTextArea
              placeholder="Describe the problem or request in detail..."
              value={content}
              onChange={setContent}
              button={false}
              minHeight={120}
              maxHeight={300}
            />
          </div>

          <PrimaryButton
            text={loading ? "Submitting..." : "Submit Ticket"}
            variant="primary"
            size="medium"
            type="submit"
            disabled={loading}
            className="w-full"
          />
        </form>

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
    </div>
  );
};

export default BugReport;
