import React, { useEffect, useState } from "react";
import { patientService } from "api/services/patient.service";
import { useAuth } from "contexts/AuthContext";

interface InsuranceCardsResponse {
  insuranceCardFront: string | null;
  insuranceCardBack: string | null;
}

const Insurance: React.FC = () => {
  const [cards, setCards] = useState<InsuranceCardsResponse>({
    insuranceCardFront: null,
    insuranceCardBack: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchInsuranceCards = async () => {
      // Check if user is logged in
      if (!user?._id) {
        setError("Please log in to view insurance cards");
        setLoading(false);
        return;
      }

      try {
        // Use the patient service to fetch insurance cards
        const data = await patientService.getInsuranceCards(user._id);

        console.log("Insurance cards fetched:", {
          hasFront: !!data.insuranceCardFront,
          hasBack: !!data.insuranceCardBack,
        });

        setCards(data);
      } catch (err: any) {
        console.error("Error fetching insurance cards:", err);
        setError(err.message || "Failed to load insurance cards");
      } finally {
        setLoading(false);
      }
    };

    fetchInsuranceCards();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading insurance cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
        <h1 className="text-2xl font-semibold">Insurance Information</h1>
        <p className="text-sm mt-2 opacity-90">
          View and manage your insurance cards
        </p>
      </div>

      {/* Cards Display */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Front of Card
                </h2>
              </div>
              <div className="p-4">
                {cards.insuranceCardFront ? (
                  <img
                    src={cards.insuranceCardFront}
                    alt="Insurance Card Front"
                    className="w-full h-auto rounded-md"
                    style={{ maxHeight: "400px", objectFit: "contain" }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-500">Front card not uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Back Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Back of Card
                </h2>
              </div>
              <div className="p-4">
                {cards.insuranceCardBack ? (
                  <img
                    src={cards.insuranceCardBack}
                    alt="Insurance Card Back"
                    className="w-full h-auto rounded-md"
                    style={{ maxHeight: "400px", objectFit: "contain" }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-500">Back card not uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
