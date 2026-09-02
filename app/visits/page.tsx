"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Member = {
  id: string;
  name: string;
};

type Visit = {
  id: string;
  visit_date: string;
  members: {
    name: string;
  }[] | null;
};

export default function VisitsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [memberId, setMemberId] = useState("");

  async function loadData() {
    const supabase = createClient();

    const { data: memberData } = await supabase
      .from("members")
      .select("id, name");

    const { data: visitData } = await supabase
      .from("visits")
      .select("id, visit_date, members(name)")
      .order("visit_date", { ascending: false });

    setMembers(memberData ?? []);
    setVisits(visitData ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addVisit() {
    if (!memberId) return;

    const supabase = createClient();

    const { error } = await supabase.from("visits").insert({
      member_id: memberId,
      visit_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      alert(error.message);
      return;
    }

    setMemberId("");
    loadData();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-bold">Visits</h1>

      <div className="mt-6 max-w-md rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">Catat Kunjungan</h2>

        <select
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          className="mt-4 w-full rounded-lg border p-3"
        >
          <option value="">Pilih Member</option>

          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <button
          onClick={addVisit}
          className="mt-3 w-full rounded-lg bg-black px-4 py-3 text-white"
        >
          Catat Kunjungan
        </button>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">Riwayat Kunjungan</h2>

        <div className="mt-4 space-y-3">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="flex justify-between rounded-lg border p-4"
            >
              <span>{visit.members?.[0]?.name ?? "Member"}</span>
              <span className="text-gray-500">
                {visit.visit_date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}