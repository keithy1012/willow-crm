import React, { useEffect, useState } from "react";
import ClaimCard from "components/card/ClaimCard";
import FinanceHeader from "components/headers/FinanceHeader";
import { useRequireRole } from "hooks/useRequireRole";

interface Claim {
  _id: string;
  claimId: string;
  insuranceProvider: string;
  description: string;
  status: "pending" | "approved" | "denied";
}

const Claims: React.FC = () => {
  const [sentClaims, setSentClaims] = useState<Claim[]>([]);
  const [reimbursementRequests, setReimbursementRequests] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useRequireRole("Finance", true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = user?.token || localStorage.getItem("token") || "";

        const authHeaders: Record<string, string> = token
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" };

        const [sentRes, reimbursementRes] = await Promise.all([
          fetch(`http://localhost:5050/api/claims/sent`, {
            method: "GET",
            headers: authHeaders,
          }),
          fetch(`http://localhost:5050/api/claims/reimbursement`, {
            method: "GET",
            headers: authHeaders,
          }),
        ]);

        if (!sentRes.ok || !reimbursementRes.ok) {
          throw new Error("Failed to fetch claims");
        }

        const sentData = await sentRes.json();
        const reimbursementData = await reimbursementRes.json();

        setSentClaims(sentData);
        setReimbursementRequests(reimbursementData);
      } catch (error) {
        console.error("Error fetching claims:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading claims...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinanceHeader userName={user.firstName}/>

      {/* Content Area */}
      <div className="p-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recently Sent Claims */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Recently sent claims
              </h2>
              <p className="text-sm text-gray-500">View all claims below</p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {sentClaims.length > 0 ? (
                sentClaims.map((claim) => (
                  <ClaimCard
                    key={claim._id}
                    claimId={claim.claimId}
                    insuranceProvider={claim.insuranceProvider}
                    description={claim.description}
                    status={claim.status}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                  <p className="text-gray-500">No sent claims found</p>
                </div>
              )}
            </div>
          </div>

          {/* Reimbursement Requests */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Reimbursement requests
              </h2>
              <p className="text-sm text-gray-500">View all claims below</p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {reimbursementRequests.length > 0 ? (
                reimbursementRequests.map((claim) => (
                  <ClaimCard
                    key={claim._id}
                    claimId={claim.claimId}
                    insuranceProvider={claim.insuranceProvider}
                    description={claim.description}
                    status={claim.status}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                  <p className="text-gray-500">No reimbursement requests found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Claims;