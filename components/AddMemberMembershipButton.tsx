"use client";

import { useState } from "react";
import AddMemberMembershipModal from "@/components/AddMemberMembershipModal";

type Props = {
  memberId: string;
  branchId: string;
};

export default function AddMemberMembershipButton({
  memberId,
  branchId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
      >
        + Tambah Membership
      </button>

      {isOpen && (
        <AddMemberMembershipModal
          memberId={memberId}
          branchId={branchId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}