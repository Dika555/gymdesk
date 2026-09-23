type MembershipReportItem = {
  id: string;
  memberName: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
};

type MembershipReportProps = {
  memberships: MembershipReportItem[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MembershipReport({
  memberships,
}: MembershipReportProps) {
  const groupedMemberships = memberships.reduce(
    (groups, membership) => {
      if (!groups[membership.planName]) {
        groups[membership.planName] = [];
      }

      groups[membership.planName].push(membership);

      return groups;
    },
    {} as Record<string, MembershipReportItem[]>
  );

  const planNames = Object.keys(groupedMemberships);

  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900">
          Data Membership
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Data membership dikelompokkan berdasarkan paket.
        </p>
      </div>

      {planNames.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          Tidak ada data membership pada periode yang dipilih.
        </p>
      ) : (
        <div className="space-y-6">
          {planNames.map((planName) => {
            const planMemberships = groupedMemberships[planName];

            return (
              <div
                key={planName}
                className="overflow-hidden rounded-lg border border-zinc-200"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-zinc-900">
                      {planName}
                    </h3>

                    <p className="text-xs text-zinc-500">
                      {planMemberships.length} member
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-left text-sm text-zinc-500">
                        <th className="px-4 py-3 font-medium">No</th>
                        <th className="px-4 py-3 font-medium">Member</th>
                        <th className="px-4 py-3 font-medium">
                          Tanggal Mulai
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Tanggal Berakhir
                        </th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {planMemberships.map((membership, index) => (
                        <tr
                          key={membership.id}
                          className="border-b border-zinc-100 last:border-b-0"
                        >
                          <td className="px-4 py-3 text-sm text-zinc-500">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                            {membership.memberName}
                          </td>

                          <td className="px-4 py-3 text-sm text-zinc-600">
                            {formatDate(membership.startDate)}
                          </td>

                          <td className="px-4 py-3 text-sm text-zinc-600">
                            {formatDate(membership.endDate)}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            <span
                              className={
                                membership.status === "active"
                                  ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                                  : "rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
                              }
                            >
                              {membership.status === "active"
                                ? "Aktif"
                                : membership.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}