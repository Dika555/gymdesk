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
    const { data, error } = await supabase
      .from("branches")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error(error);
      alert("Gagal mengambil data cabang: " + error.message);
      return;
    }

    const branchList = data ?? [];

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
  document.cookie = `activeBranchId=${branchId}; path=/`;

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