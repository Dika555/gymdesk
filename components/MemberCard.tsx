type MemberCardProps = {
  id: string;
  name: string;
  phone: string;
  membership: string;
  onEdit: () => void;
  onDelete: (id: string) => void;
};

export default function MemberCard({
  id,
  name,
  phone,
  membership,
  onEdit,
  onDelete,
}: MemberCardProps) {
  return (
  <div className="rounded-xl bg-white p-5 shadow">
    <h2 className="text-xl font-semibold">{name}</h2>

    <p className="mt-2 text-gray-600">
      No. HP: {phone}
    </p>

    <p className="mt-1">
      Membership: {membership}
    </p>

    <div className="mt-4 flex gap-2">
      <button
  onClick={onEdit}
        className="rounded-lg bg-orange-500 px-4 py-2 text-black"
      >
        Edit
      </button>

      <button
        onClick={() => onDelete(id)}
        className="rounded-lg bg-red-600 px-4 py-2 text-white"
      >
        Hapus
      </button>
    </div>
  </div>
);
}