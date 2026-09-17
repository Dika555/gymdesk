"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type TrainerMember = {
  id: string;
  name: string;
};

type Trainer = {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  members: TrainerMember[];
};

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState<TrainerMember[]>([]);
  const [selectedMember, setSelectedMember] = useState("");

  useEffect(() => {
    console.log("TRAINERS PAGE TERBUKA");
    loadTrainers();
    loadMembers();
  }, []);

  async function loadTrainers() {
    console.log("=== LOAD TRAINERS ===");

    const supabase = createClient();
    const branchId = getActiveBranchId();

    console.log("Active Branch ID:", branchId);

    if (!branchId) {
      setTrainers([]);
      return;
    }

    const { data, error } = await supabase
      .from("trainers")
      .select("id, name, phone, specialization, branch_id")
      .eq("branch_id", branchId)
      .order("name");

    if (error) {
      console.error("Gagal mengambil trainer:", error);
      return;
    }

    const trainerIds = (data ?? []).map((trainer) => trainer.id);

    let trainerMemberData: {
      trainer_id: string;
      member_id: string;
    }[] = [];

    if (trainerIds.length > 0) {
      const { data: relations, error: relationError } =
        await supabase
          .from("trainer_members")
          .select("trainer_id, member_id")
          .in("trainer_id", trainerIds);

      if (relationError) {
        console.error(
          "Gagal mengambil hubungan trainer-member:",
          relationError
        );
        return;
      }

      trainerMemberData = relations ?? [];
    }

    const memberIds = [
      ...new Set(
        trainerMemberData.map((item) => item.member_id)
      ),
    ];

    let memberData: TrainerMember[] = [];

    if (memberIds.length > 0) {
      const { data: membersData, error: memberError } =
        await supabase
          .from("members")
          .select("id, name")
          .in("id", memberIds);

      if (memberError) {
        console.error(
          "Gagal mengambil nama member:",
          memberError
        );
        return;
      }

      memberData = membersData ?? [];
    }

    setTrainers(
      (data ?? []).map((trainer) => ({
        ...trainer,
        members: trainerMemberData
          .filter(
            (relation) =>
              relation.trainer_id === trainer.id
          )
          .map((relation) =>
            memberData.find(
              (member) =>
                member.id === relation.member_id
            )
          )
          .filter(
            (member): member is TrainerMember =>
              member !== undefined
          ),
      }))
    );
  }

  async function loadMembers() {
    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      setMembers([]);
      return;
    }

    const { data, error } = await supabase
      .from("members")
      .select("id, name")
      .eq("branch_id", branchId)
      .order("name");

    if (error) {
      console.error("Gagal mengambil member:", error);
      return;
    }

    setMembers(data ?? []);
  }

  async function addTrainer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const supabase = createClient();

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("trainers")
      .insert({
        name,
        phone,
        specialization,
        branch_id: branchId,
      });

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setName("");
    setPhone("");
    setSpecialization("");
    setIsOpen(false);

    loadTrainers();
  }

  async function deleteTrainer(id: string) {
    const confirmed = confirm(
      "Yakin ingin menghapus trainer ini?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const branchId = getActiveBranchId();

    console.log("Branch aktif:", branchId);

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      return;
    }

    const { error } = await supabase
      .from("trainers")
      .delete()
      .eq("id", id)
      .eq("branch_id", branchId);

    if (error) {
      alert(error.message);
      return;
    }

    loadTrainers();
  }

  async function addMemberToTrainer() {
    if (!selectedTrainer) {
      alert("Trainer belum dipilih.");
      return;
    }

    if (!selectedMember) {
      alert("Silakan pilih member terlebih dahulu.");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("trainer_members")
      .insert({
        trainer_id: selectedTrainer,
        member_id: selectedMember,
        start_date: new Date().toISOString().split("T")[0],
      });

    if (error) {
      console.error("Gagal menambahkan member ke trainer:", error);
      alert(error.message);
      return;
    }

    alert("Member berhasil ditambahkan ke trainer.");

    await loadTrainers();

    setSelectedTrainer(null);
    setSelectedMember("");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Trainers
          </h1>

          <p className="mt-1 text-gray-600">
            Kelola data trainer gym
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + Tambah Trainer
        </button>
      </div>

      {/* Daftar trainer */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            className="rounded-xl bg-white p-6 shadow"
          >
            <h2 className="text-xl font-bold">
              {trainer.name}
            </h2>

            <p className="mt-3 text-gray-600">
              {trainer.phone}
            </p>

            <p className="mt-1 text-gray-600">
              {trainer.specialization}
            </p>

            <div className="mt-5 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  Member yang Ditangani
                </h3>

                <button
                  type="button"
                  onClick={() => setSelectedTrainer(trainer.id)}
                  className="text-sm font-medium text-orange-500 hover:text-orange-600"
                >
                  + Tambah Member
                </button>
              </div>

              {trainer.members.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">
                  Belum ada member.
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {trainer.members.map((member) => (
                    <li
                      key={member.id}
                      className="text-sm text-gray-600"
                    >
                      • {member.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => deleteTrainer(trainer.id)}
              className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>

      {/* Modal tambah trainer */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Tambah Trainer
              </h2>

              <button
                onClick={() => setIsOpen(false)}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={addTrainer}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Trainer
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  className="w-full rounded-lg border p-3"
                  placeholder="Masukkan nama trainer"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nomor HP
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  required
                  className="w-full rounded-lg border p-3"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Spesialisasi
                </label>

                <input
                  type="text"
                  value={specialization}
                  onChange={(e) =>
                    setSpecialization(e.target.value)
                  }
                  required
                  className="w-full rounded-lg border p-3"
                  placeholder="Contoh: Personal Trainer"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-4 py-3 text-white"
              >
                {loading
                  ? "Menyimpan..."
                  : "Simpan Trainer"}
              </button>
            </form>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full rounded-lg border px-4 py-3"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {selectedTrainer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Tambah Member ke Trainer
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelectedTrainer(null);
                  setSelectedMember("");
                }}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Pilih Member
              </label>

              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Pilih member</option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={addMemberToTrainer}
              className="mt-5 w-full rounded-lg bg-orange-500 px-4 py-3 font-medium text-white"
            >
              Simpan
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTrainer(null);
                setSelectedMember("");
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