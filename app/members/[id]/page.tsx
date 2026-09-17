import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddMemberMembershipButton from "@/components/AddMemberMembershipButton";

type MemberDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MemberDetailPage({
  params,
}: MemberDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Ambil data member
  const { data: member, error: memberError } =
    await supabase
      .from("members")
      .select(`
        id,
        name,
        phone,
        email,
        address,
        gender,
        membership,
        status,
        created_at,
        branch_id
      `)
      .eq("id", id)
      .single();

  if (memberError || !member) {
    notFound();
  }

  // Ambil riwayat membership member
  const { data: memberships, error: membershipError } =
    await supabase
      .from("memberships")
      .select(
        `
        id,
        start_date,
        end_date,
        status,
        membership_plans!memberships_plan_id_fkey (
          id,
          name,
          duration,
          price
        )
        `
      )
      .eq("member_id", id)
      .order("start_date", { ascending: false });

  if (membershipError) {
    console.error(membershipError);
  }

    // Ambil riwayat kunjungan member
  const { data: visits, error: visitsError } =
    await supabase
      .from("visits")
      .select(`
        id,
        visit_date,
        visit_fee,
        payment_method
      `)
      .eq("member_id", id)
      .order("visit_date", { ascending: false });

  if (visitsError) {
    console.error(visitsError);
  }

  // Membership aktif
  const activeMembership =
    memberships?.find(
      (membership) => membership.status === "active"
    ) ?? null;

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      {/* Header */}
      <div className="mb-6">
        <a
          href="/members"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Kembali ke Members
        </a>

        <h1 className="mt-3 text-3xl font-bold">
          Detail Member
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Informasi lengkap member GymDesk.
        </p>
      </div>

      {/* Informasi Member */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {member.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Member sejak{" "}
              {new Date(
                member.created_at
              ).toLocaleDateString("id-ID")}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm ${
              member.status === "aktif"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {member.status === "aktif"
              ? "Aktif"
              : "Tidak Aktif"}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">
              No. HP
            </p>

            <p className="mt-1 font-medium">
              {member.phone || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1 font-medium">
              {member.email || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Jenis Kelamin
            </p>

            <p className="mt-1 font-medium">
              {member.gender || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Membership
            </p>

            <p className="mt-1 font-medium">
              {member.membership || "-"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">
              Alamat
            </p>

            <p className="mt-1 font-medium">
              {member.address || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Membership Saat Ini */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Membership Saat Ini
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Paket membership yang sedang digunakan.
            </p>
          </div>

          <AddMemberMembershipButton
            memberId={member.id}
            branchId={member.branch_id}
          />
        </div>

        {activeMembership ? (
          <div className="mt-5 rounded-lg border p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {activeMembership.membership_plans?.[0]?.name
                    || "-"}
                </h3>

                <p className="mt-1 text-gray-500">
                  Rp
                  {activeMembership.membership_plans?.[0]?.price.toLocaleString(
                    "id-ID"
                  ) ?? "0"}{" "}
                  /{" "}
                  {activeMembership.membership_plans?.[0]?.duration ??
                    "-"}{" "}
                  bulan
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                Aktif
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Tanggal Mulai
                </p>

                <p className="mt-1 font-medium">
                  {new Date(
                    activeMembership.start_date
                  ).toLocaleDateString("id-ID")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Tanggal Berakhir
                </p>

                <p className="mt-1 font-medium">
                  {new Date(
                    activeMembership.end_date
                  ).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">
              Member belum memiliki membership aktif.
            </p>
          </div>
        )}
      </div>

      {/* Riwayat Membership */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">
          Riwayat Membership
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Riwayat paket membership yang pernah digunakan.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 text-sm font-semibold">
                  Paket
                </th>

                <th className="px-4 py-3 text-sm font-semibold">
                  Mulai
                </th>

                <th className="px-4 py-3 text-sm font-semibold">
                  Berakhir
                </th>

                <th className="px-4 py-3 text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {memberships && memberships.length > 0 ? (
                memberships.map((membership) => (
                  <tr
                    key={membership.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {membership.membership_plans?.[0]?.name ??
                        "-"}
                    </td>

                    <td className="px-4 py-3">
                      {new Date(
                        membership.start_date
                      ).toLocaleDateString("id-ID")}
                    </td>
  
                    <td className="px-4 py-3">
                      {new Date(
                        membership.end_date
                      ).toLocaleDateString("id-ID")}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          membership.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {membership.status === "active"
                          ? "Aktif"
                          : "Tidak Aktif"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Belum ada riwayat membership.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

            {/* Riwayat Kunjungan */}
            <div className="mt-6 rounded-xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold">
                Riwayat Kunjungan
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Daftar kunjungan member ke gym.
              </p>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-4 py-3 text-sm font-semibold">
                        Tanggal
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold">
                        Biaya
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold">
                        Pembayaran
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visits && visits.length > 0 ? (
                      visits.map((visit) => (
                        <tr
                          key={visit.id}
                          className="border-b last:border-b-0"
                        >
                          <td className="px-4 py-3">
                            {new Date(
                              `${visit.visit_date}T00:00:00`
                            ).toLocaleDateString("id-ID")}
                          </td>

                          <td className="px-4 py-3">
                            Rp{" "}
                            {visit.visit_fee.toLocaleString(
                              "id-ID"
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {visit.payment_method === "cash"
                              ? "Cash"
                              : visit.payment_method === "qris"
                                ? "QRIS"
                                : visit.payment_method === "transfer"
                                  ? "Transfer"
                                  : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          Belum ada riwayat kunjungan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
    </main>
  );
}