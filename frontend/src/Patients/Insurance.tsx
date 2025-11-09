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
      console.log("=== Insurance Card Fetch Debug ===");
      console.log("User object:", user);
      console.log("User ID:", user?._id);
      console.log("Token exists:", !!token);
      console.log("Token value:", token);
      
      if (!user?._id) {
        console.error("ERROR: User not logged in or no user ID");
        setError("User not logged in");
        setLoading(false);
        return;
      }
 
      const url = `http://localhost:5050/api/patients/${user._id}/insuranceCards`;
      console.log("Fetching from URL:", url);
      
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
 
        console.log("Response status:", res.status);
        console.log("Response ok:", res.ok);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Response error text:", errorText);
          throw new Error(`Failed to fetch insurance cards: ${res.status} - ${errorText}`);
        }
 
        const data: InsuranceCardsResponse = await res.json();
        console.log("Received data:", data);
        console.log("Has front card:", !!data.insuranceCardFront);
        console.log("Has back card:", !!data.insuranceCardBack);
        
        if (data.insuranceCardFront) {
          console.log("Front card preview:", data.insuranceCardFront.substring(0, 100));
        }
        if (data.insuranceCardBack) {
          console.log("Back card preview:", data.insuranceCardBack.substring(0, 100));
        }
        
        setCards(data);
        console.log("Successfully set cards state");
      } catch (err: any) {
        console.error("ERROR caught:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log("=== Fetch Complete ===");
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
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <div className="text-sm text-gray-500">Check console for details</div>
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
          <div className="p-4 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Front card not uploaded</p>
          </div>
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
          <div className="p-4 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Back card not uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Insurance;