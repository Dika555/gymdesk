"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MemberCard from "@/components/MemberCard";
import AddMemberForm from "@/components/AddMemberForm";

type Member = {
  id: string;
  name: string;
  phone: string;
  membership: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  async function getMembers() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("members")
      .select("id, name, phone, membership");

    if (error) {
      console.error(error);
      return;
    }

    setMembers(data ?? []);
  }

  useEffect(() => {
    getMembers();
  }, []);

  function handleSuccess() {
    setIsOpen(false);
    getMembers();
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("Yakin ingin menghapus member ini?");

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    getMembers();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Members</h1>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + Tambah Member
        </button>
      </div>

      {members.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              id={member.id}
              name={member.name}
              phone={member.phone}
              membership={member.membership}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white p-5 shadow">
          Belum ada data member.
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Tambah Member</h2>

              <button
                onClick={() => setIsOpen(false)}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <AddMemberForm onSuccess={handleSuccess} />

            <button
              onClick={() => setIsOpen(false)}
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