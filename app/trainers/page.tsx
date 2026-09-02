"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Trainer = {
  id: string;
  name: string;
  phone: string;
  specialization: string;
};

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadTrainers() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("trainers")
      .select("id, name, phone, specialization")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setTrainers(data ?? []);
  }

  useEffect(() => {
    loadTrainers();
  }, []);

  async function addTrainer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.from("trainers").insert({
      name,
      phone,
      specialization,
    });

    setLoading(false);

    if (error) {
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

    const { error } = await supabase
      .from("trainers")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadTrainers();
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
    </main>
  );
}