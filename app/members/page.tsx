"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";
import AddMemberForm from "@/components/AddMemberForm";

type Member = {
  id: string;
  name: string;
  phone: string;
  membership: string;
  status: string;
  memberships: {
    status: string;
    end_date: string;
    membership_plans: {
      name: string;
    }[];
  }[];
};

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [editingMember, setEditingMember] =
    useState<Member | null>(null);

  async function getMembers() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMembers([]);
      return;
    }

    // Ambil data member
    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .select(`
      id,
      name,
      phone,
      membership,
      status
    `)
      .eq("branch_id", branchId)
      .order("name", { ascending: true });

    if (memberError) {
      console.error("Gagal mengambil member:", memberError);
      return;
    }

    // Ambil data membership pada cabang aktif
    const { data: membershipData, error: membershipError } =
      await supabase
        .from("memberships")
        .select(`
        id,
        member_id,
        plan_id,
        status,
        end_date
      `)
        .eq("branch_id", branchId);

    if (membershipError) {
      console.error(
        "Gagal mengambil membership:",
        membershipError
      );
      return;
    }

    // Ambil paket membership pada cabang aktif
    const { data: planData, error: planError } = await supabase
      .from("membership_plans")
      .select(`
      id,
      name
    `)
      .eq("branch_id", branchId);

    if (planError) {
      console.error(
        "Gagal mengambil paket membership:",
        planError
      );
      return;
    }

    // Gabungkan data membership dengan nama paket
    const membersWithMembership = (memberData ?? []).map(
      (member) => {
        const memberMemberships = (membershipData ?? [])
          .filter(
            (membership) =>
              membership.member_id === member.id
          )
          .map((membership) => {
            const plan = (planData ?? []).find(
              (plan) => plan.id === membership.plan_id
            );

            return {
              status: membership.status,
              end_date: membership.end_date,
              membership_plans: plan
                ? [{ name: plan.name }]
                : [],
            };
          });

        return {
          ...member,
          memberships: memberMemberships,
        };
      }
    );

    setMembers(membersWithMembership);
  }

  useEffect(() => {
    getMembers();
  }, []);

  // Filter berdasarkan pencarian
  const filteredMembers = members.filter((member) => {
    const keyword = search.toLowerCase();

    return (
      member.name.toLowerCase().includes(keyword) ||
      member.phone.toLowerCase().includes(keyword)
    );
  });

  // Jumlah halaman
  const totalPages = Math.ceil(
    filteredMembers.length / ITEMS_PER_PAGE
  );

  // Data yang ditampilkan pada halaman sekarang
  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const currentMembers = filteredMembers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleEdit(member: Member) {
    setEditingMember(member);
    setIsOpen(true);
  }

  function handleSuccess() {
    setIsOpen(false);
    setEditingMember(null);
    getMembers();
  }

  async function handleDelete(id: string) {
    const confirmed = confirm(
      "Yakin ingin menghapus member ini?"
    );

    if (!confirmed) return;

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id)
      .eq("branch_id", branchId);

    if (error) {
      alert(error.message);
      return;
    }

    getMembers();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Members
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola data member GymDesk.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMember(null);
            setIsOpen(true);
          }}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + Tambah Member
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Cari nama atau nomor HP..."
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-5 py-4 text-sm font-semibold">
                Nama
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                No. HP
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Membership
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Status
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {currentMembers.length > 0 ? (
              currentMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium">
                    {member.name}
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {member.phone}
                  </td>

                  <td className="px-5 py-4">
                    {member.memberships?.find(
                      (membership) =>
                        membership.status === "active" &&
                        membership.end_date >=
                        new Date().toISOString().split("T")[0]
                    )?.membership_plans?.[0]?.name ?? "Belum ada"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${member.status === "aktif"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {member.status === "aktif"
                        ? "Aktif"
                        : "Tidak Aktif"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <a
                        href={`/members/${member.id}`}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium"
                      >
                        Detail
                      </a>

                      <button
                        onClick={() => handleEdit(member)}
                        className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-black"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(member.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-gray-500"
                >
                  {search
                    ? "Member tidak ditemukan."
                    : "Belum ada data member."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan{" "}
            {startIndex + 1}–
            {Math.min(
              startIndex + ITEMS_PER_PAGE,
              filteredMembers.length
            )}{" "}
            dari {filteredMembers.length} member
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              disabled={currentPage === 1}
              className="rounded-lg border bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-lg px-3 py-2 ${currentPage === page
                  ? "bg-black text-white"
                  : "border bg-white"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingMember
                  ? "Edit Member"
                  : "Tambah Member"}
              </h2>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setEditingMember(null);
                }}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <AddMemberForm
              onSuccess={handleSuccess}
              member={editingMember ?? undefined}
            />

            <button
              onClick={() => {
                setIsOpen(false);
                setEditingMember(null);
              }}
              className="mt-3 w-full rounded-lg border px-4 py-3"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </main>
  );
}