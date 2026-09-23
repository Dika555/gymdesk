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
  status: "active" | "inavtive";
  memberCount: number;
};

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrainers();
  }, []);

  async function addTrainer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const supabase = createClient();
    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const specialization = String(
      formData.get("specialization") ?? ""
    ).trim();

    if (!name) {
      alert("Nama trainer wajib diisi.");
      return;
    }

    const { error } = await supabase.from("trainers").insert({
      name,
      phone,
      specialization,
      branch_id: branchId,
    });

    if (error) {
      console.error("Gagal menambahkan trainer:", error);
      alert("Gagal menambahkan trainer.");
      return;
    }

    setIsOpen(false);
    await loadTrainers();
  }

  async function loadTrainers() {
    const supabase = createClient();
    const branchId = getActiveBranchId();

    if (!branchId) {
      setTrainers([]);
      return;
    }

    const { data, error } = await supabase
      .from("trainers")
      .select(
        "id, name, phone, specialization, branch_id, status"
      )
      .eq("branch_id", branchId)
      .order("name");

    const trainerIds = (data ?? []).map((trainer) => trainer.id);

    let memberRelations: {
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

      memberRelations = relations ?? [];
    }

    const memberCountMap = new Map<string, number>();

    for (const relation of memberRelations) {
      memberCountMap.set(
        relation.trainer_id,
        (memberCountMap.get(relation.trainer_id) ?? 0) + 1
      );
    }

    const formattedTrainers = (data ?? [])
      .map((trainer) => ({
        id: trainer.id,
        name: trainer.name,
        phone: trainer.phone,
        specialization: trainer.specialization,
        status: trainer.status,
        memberCount: memberCountMap.get(trainer.id) ?? 0,
      }))
      .sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "active" ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
      });

    setTrainers(formattedTrainers);
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
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-bold">
              {trainer.name}
            </h2>

            <p
              className={`mt-1 text-sm font-medium ${trainer.status === "active"
                  ? "text-green-600"
                  : "text-zinc-500"
                }`}
            >
              {trainer.status === "active"
                ? "Aktif"
                : "Tidak Aktif"}
            </p>

            <p className="mt-3 text-gray-600">
              {trainer.phone}
            </p>

            <p className="mt-1 text-gray-600">
              {trainer.specialization}
            </p>

            <div className="mt-5 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Member yang Ditangani
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {trainer.memberCount} Member
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/trainers/${trainer.id}`;
                }}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Lihat Detail
              </button>
            </div>
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
                  name="name"
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
                  name="phone"
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
                  name="specialization"
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
    </main>
  );
}