import React from "react";
import { LockKey } from "phosphor-react";

const EncryptionBadge: React.FC = () => {
  return (
    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
      <LockKey size={12} weight="fill" />
      <span>End-to-end encrypted</span>
    </div>
  );
};

export default EncryptionBadge;
