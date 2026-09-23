type MemberReport = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  address: string | null;
  status: string | null;
  created_at: string;
};

type MembersReportProps = {
  members: MemberReport[];
};

export default function MembersReport({
  members,
}: MembersReportProps) {
  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900">
          Data Member
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Member yang terdaftar pada periode yang dipilih.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700">
                No
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700">
                Nama
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700">
                No HP
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700">
                Gender
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700">
                Alamat
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700">
                Tanggal Bergabung
              </th>
            </tr>
          </thead>

          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-zinc-500"
                >
                  Tidak ada data member pada periode ini.
                </td>
              </tr>
            ) : (
              members.map((member, index) => (
                <tr
                  key={member.id}
                  className="border-b border-zinc-100 last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                    {member.name}
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {member.phone ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {member.email ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {member.gender ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {member.address ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {member.status ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {new Date(member.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}