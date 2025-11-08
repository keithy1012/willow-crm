import React, { useEffect, useState } from "react";

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

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchInsuranceCards = async () => {
      if (!user?._id) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5050/api/patients/getInsurance/${user._id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch insurance cards");
        }

        const data: InsuranceCardsResponse = await res.json();
        setCards(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsuranceCards();
  }, [user._id, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading insurance cards...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Your Insurance Cards</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.insuranceCardFront ? (
          <div>
            <h2 className="text-lg font-medium mb-2">Front</h2>
            <img
              src={cards.insuranceCardFront}
              alt="Insurance Card Front"
              className="border rounded-lg shadow-md max-w-full"
            />
          </div>
        ) : (
          <p>Front card not uploaded</p>
        )}

        {cards.insuranceCardBack ? (
          <div>
            <h2 className="text-lg font-medium mb-2">Back</h2>
            <img
              src={cards.insuranceCardBack}
              alt="Insurance Card Back"
              className="border rounded-lg shadow-md max-w-full"
            />
          </div>
        ) : (
          <p>Back card not uploaded</p>
        )}
      </div>
    </div>
  );
};

export default Insurance;
