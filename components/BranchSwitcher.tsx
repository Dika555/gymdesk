"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Branch = {
  id: string;
  name: string;
};

export default function BranchSwitcher() {
  const supabase = createClient();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        alert("Tidak ada user yang sedang login.");
        return;
    }

    const { data: accessData, error: accessError } = await supabase
        .from("user_branches")
        .select("branch_id")
        .eq("user_id", user.id);

    if (accessError) {
        console.error(accessError);
        alert("Gagal mengambil akses cabang: " + accessError.message);
        return;
    }

    if (!accessData || accessData.length === 0) {
        alert("User ini belum memiliki akses cabang.");
        return;
    }

    const branchIds = accessData.map((item) => item.branch_id);

    const { data: branchData, error: branchError } = await supabase
        .from("branches")
        .select("id, name")
        .in("id", branchIds);

    if (branchError) {
        console.error(branchError);
        alert("Gagal mengambil data cabang: " + branchError.message);
        return;
    }

    const branchList: Branch[] = branchData ?? [];

    setBranches(branchList);

    const savedBranch = localStorage.getItem("activeBranchId");

    if (
        savedBranch &&
        branchList.some((branch) => branch.id === savedBranch)
    ) {
        setSelectedBranch(savedBranch);
    } else if (branchList.length > 0) {
        setSelectedBranch(branchList[0].id);
        localStorage.setItem("activeBranchId", branchList[0].id);
    }
    }

  function handleChange(branchId: string) {
    setSelectedBranch(branchId);
    localStorage.setItem("activeBranchId", branchId);

    window.location.reload();
  }

  return (
    <select
      value={selectedBranch}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-orange-500"
    >
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
  );
}