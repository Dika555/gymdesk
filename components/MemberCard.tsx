type MemberCardProps = {
  id: string;
  name: string;
  phone: string;
  membership: string;
  onDelete: (id: string) => void;
};

export default function MemberCard({
  id,
  name,
  phone,
  membership,
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

      <button
        onClick={() => onDelete(id)}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
      >
        Hapus
      </button>
    </div>
  );
}