"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type MembershipPlan = {
  id: string;
  name: string;
  duration: number;
  price: number;
  benefits: string[];
  memberCount: number;
};

type MemberSubscription = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  member: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
};

export default function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] =
    useState<MembershipPlan | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [benefits, setBenefits] = useState("");
  const [saving, setSaving] = useState(false);

  const [subscribers, setSubscribers] = useState<
    MemberSubscription[]
  >([]);

  const [loadingSubscribers, setLoadingSubscribers] =
    useState(false);

  async function getPlans() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setPlans([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("membership_plans")
      .select("id, name, duration, price, benefits")
      .eq("branch_id", branchId)
      .order("price");

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const plansWithMemberCount = await Promise.all(
      (data ?? []).map(async (plan) => {
        const { count, error: countError } = await supabase
          .from("memberships")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("plan_id", plan.id)
          .eq("branch_id", branchId)
          .eq("status", "active");

        if (countError) {
          console.error(countError);
        }

        return {
          ...plan,
          memberCount: count ?? 0,
        };
      })
    );

    setPlans(plansWithMemberCount);
    setLoading(false);
  }

  async function getSubscribers(planId: string) {
    setLoadingSubscribers(true);

    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setSubscribers([]);
      setLoadingSubscribers(false);
      return;
    }

    // Ambil membership dari paket yang dipilih
    const { data: membershipData, error: membershipError } =
      await supabase
        .from("memberships")
        .select(`
        id,
        member_id,
        start_date,
        end_date,
        status
      `)
        .eq("plan_id", planId)
        .eq("branch_id", branchId)
        .order("start_date", { ascending: false });

    if (membershipError) {
      console.error(
        "Gagal mengambil membership:",
        membershipError
      );
      setSubscribers([]);
      setLoadingSubscribers(false);
      return;
    }

    // Ambil semua member dari cabang aktif
    const { data: memberData, error: memberError } =
      await supabase
        .from("members")
        .select(`
        id,
        name,
        phone
      `)
        .eq("branch_id", branchId);

    if (memberError) {
      console.error(
        "Gagal mengambil member:",
        memberError
      );
      setSubscribers([]);
      setLoadingSubscribers(false);
      return;
    }

    // Gabungkan membership dengan data member
    const subscribersData = (membershipData ?? []).map(
      (membership) => {
        const member = (memberData ?? []).find(
          (member) =>
            member.id === membership.member_id
        );

        return {
          id: membership.id,
          start_date: membership.start_date,
          end_date: membership.end_date,
          status: membership.status,
          member: member
            ? {
              id: member.id,
              name: member.name,
              phone: member.phone,
            }
            : null,
        };
      }
    );

    setSubscribers(subscribersData);
    setLoadingSubscribers(false);
  }

  function handleOpenPlan(plan: MembershipPlan) {
    setSelectedPlan(plan);
    getSubscribers(plan.id);
  }

  function handleClosePlan() {
    setSelectedPlan(null);
    setSubscribers([]);
  }

  async function handleAddMembership(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!name || !duration || !price) {
      alert("Nama, durasi, dan harga wajib diisi.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang belum dipilih.");
      setSaving(false);
      return;
    }

    const benefitsArray = benefits
      .split("\n")
      .map((benefit) => benefit.trim())
      .filter((benefit) => benefit !== "");

    const { error } = await supabase
      .from("membership_plans")
      .insert({
        name,
        duration: Number(duration),
        price: Number(price),
        benefits: benefitsArray,
        branch_id: branchId,
      });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    setDuration("");
    setPrice("");
    setBenefits("");

    setIsFormOpen(false);

    getPlans();
  }

  useEffect(() => {
    getPlans();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8 text-black">
        <p className="text-gray-500">
          Memuat data membership...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Membership
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola paket membership yang tersedia di GymDesk.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="rounded-lg bg-black px-4 py-2 font-medium text-white"
        >
          + Tambah Membership
        </button>
      </div>

      {/* Membership Cards */}
      {plans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleOpenPlan(plan)}
              className="rounded-xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold">
                {plan.name}
              </h2>

              <div className="mt-4">
                <span className="text-3xl font-bold">
                  Rp{plan.price.toLocaleString("id-ID")}
                </span>

                <span className="ml-1 text-sm text-gray-500">
                  / {plan.duration} bulan
                </span>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold">
                  Keuntungan
                </p>

                <ul className="space-y-2">
                  {plan.benefits.length > 0 ? (
                    plan.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600"
                      >
                        ✓ {benefit}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-400">
                      Belum ada benefit.
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-6 border-t pt-4">
                <p className="text-sm text-gray-500">
                  Member Aktif
                </p>

                <p className="mt-1 text-xl font-bold">
                  {plan.memberCount} Member
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Klik untuk melihat daftar member
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <p className="text-gray-500">
            Belum ada paket membership.
          </p>
        </div>
      )}

      {/* Modal detail */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedPlan.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Rp
                  {selectedPlan.price.toLocaleString("id-ID")}{" "}
                  / {selectedPlan.duration} bulan
                </p>
              </div>

              <button
                onClick={handleClosePlan}
                className="text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold">
                Member yang berlangganan
              </h3>

              {loadingSubscribers ? (
                <p className="mt-5 text-sm text-gray-500">
                  Memuat data member...
                </p>
              ) : subscribers.length > 0 ? (
                <div className="mt-4 overflow-x-auto rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left">
                        <th className="px-4 py-3 text-sm font-semibold">
                          Nama
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold">
                          No. HP
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
                      {subscribers.map((subscription) => (
                        <tr
                          key={subscription.id}
                          className="border-b last:border-b-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            {subscription.member?.name ?? "-"}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {subscription.member?.phone ?? "-"}
                          </td>

                          <td className="px-4 py-3">
                            {new Date(
                              subscription.start_date
                            ).toLocaleDateString("id-ID")}
                          </td>

                          <td className="px-4 py-3">
                            {new Date(
                              subscription.end_date
                            ).toLocaleDateString("id-ID")}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${subscription.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {subscription.status === "active"
                                ? "Aktif"
                                : "Tidak Aktif"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-gray-50 p-8 text-center">
                  <p className="text-sm text-gray-500">
                    Belum ada member yang berlangganan paket ini.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleClosePlan}
              className="mt-6 w-full rounded-lg border px-4 py-3 font-medium hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal tambah membership */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Tambah Membership
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Tambahkan paket membership baru.
                </p>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddMembership}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Membership
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Premium"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Durasi
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value)
                    }
                    placeholder="3"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />

                  <span className="text-sm text-gray-500">
                    bulan
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Harga
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Rp
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    placeholder="350000"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Keuntungan
                </label>

                <textarea
                  value={benefits}
                  onChange={(e) =>
                    setBenefits(e.target.value)
                  }
                  placeholder={
                    "Akses seluruh area gym\nFree locker\nKonsultasi trainer"
                  }
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Tulis satu keuntungan di setiap baris.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-full rounded-lg border px-4 py-3 font-medium"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}