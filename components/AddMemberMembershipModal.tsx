"use client";

import AddMemberMembershipForm from "@/components/AddMemberMembershipForm";

type Props = {
  memberId: string;
  branchId: string;
  onClose: () => void;
};

export default function AddMemberMembershipModal({
  memberId,
  branchId,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Tambah Membership
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <AddMemberMembershipForm
          memberId={memberId}
          branchId={branchId}
        />

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-lg border px-4 py-2 font-medium"
        >
          Batal
        </button>
      </div>
    </div>
  );
}