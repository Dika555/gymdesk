"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type Trainer = {
    id: string;
    name: string;
    phone: string;
    specialization: string;
    price_per_session: number;
    status: string;
};

type TrainerPackage = {
    id: string;
    name: string;
    session_count: number;
    price: number;
    status: string;
};

type TrainerMember = {
    id: string;
    name: string;
    remaining_sessions: number;
    has_active_package: boolean;
};

type AvailableMember = {
    id: string;
    name: string;
};

type TrainerPackageMember = {
    id: string;
    member_id: string;
    trainer_package_id: string;
    total_sessions: number;
    remaining_sessions: number;
    purchase_date: string;
    status: string;
    member_name: string;
    package_name: string;
};

type TrainerSession = {
    id: string;
    member_name: string;
    session_date: string;
    notes: string | null;
    price: number;
    payment_method: string | null;
    session_type: "package" | "single";
};

export default function TrainerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState<TrainerPackage[]>([]);
    const [members, setMembers] = useState<TrainerMember[]>([]);
    const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
    const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [savingMember, setSavingMember] = useState(false);
    const [packageMembers, setPackageMembers] = useState<TrainerPackageMember[]>([]);

    const activePackageMembers = packageMembers.filter(
        (item) => item.status === "active" && item.remaining_sessions > 0
    );

    const completedPackageMembers = packageMembers.filter(
        (item) =>
            item.status === "completed" ||
            item.status === "cancelled" ||
            item.remaining_sessions <= 0
    );
    const [sessions, setSessions] = useState<TrainerSession[]>([]);
    const [sessionSearch, setSessionSearch] = useState("");
    const [sessionStartDate, setSessionStartDate] = useState("");
    const [sessionEndDate, setSessionEndDate] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [pricePerSession, setPricePerSession] = useState("");
    const [saving, setSaving] = useState(false);

    const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
    const [packageName, setPackageName] = useState("");
    const [packageSessionCount, setPackageSessionCount] = useState("");
    const [packagePrice, setPackagePrice] = useState("");
    const [savingPackage, setSavingPackage] = useState(false);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

    const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
    const [sessionPackageMemberId, setSessionPackageMemberId] = useState("");
    const [sessionDate, setSessionDate] = useState("");
    const [sessionNotes, setSessionNotes] = useState("");

    const [sessionMemberId, setSessionMemberId] = useState("");
    const [sessionPaymentMethod, setSessionPaymentMethod] = useState("cash");

    const [sessionCustomerType, setSessionCustomerType] = useState<
        "member" | "non-member"
    >("member");

    const [sessionVisitorName, setSessionVisitorName] = useState("");

    const [savingSession, setSavingSession] = useState(false);

    const [sessionType, setSessionType] = useState<"package" | "single">(
        "package"
    );

    const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
    const [purchaseMemberId, setPurchaseMemberId] = useState("");
    const [purchasePackageId, setPurchasePackageId] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [purchasePaymentMethod, setPurchasePaymentMethod] = useState("");
    const [purchaseNotes, setPurchaseNotes] = useState("");
    const [savingPurchase, setSavingPurchase] = useState(false);

    useEffect(() => {
        async function loadTrainer() {
            const { id } = await params;

            const supabase = createClient();
            const branchId = getActiveBranchId();

            if (!branchId) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("trainers")
                .select("id, name, phone, specialization, price_per_session, status")
                .eq("id", id)
                .eq("branch_id", branchId)
                .single();

            if (error) {
                console.error("Gagal mengambil trainer:", error);
                setLoading(false);
                return;
            }

            setTrainer(data);
            await loadPackages(id);
            await loadSessionMembers(id);
            await loadAvailableMembers(id);
            await loadPackageMembers(id);
            await loadSessions(id);
            setLoading(false);
        }

        loadTrainer();
    }, [params]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <p>Memuat data trainer...</p>
            </main>
        );
    }

    if (!trainer) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <p>Trainer tidak ditemukan.</p>
            </main>
        );
    }

    function startEditing() {
        if (!trainer) return;

        setName(trainer.name);
        setPhone(trainer.phone);
        setSpecialization(trainer.specialization);
        setPricePerSession(String(trainer.price_per_session));

        setIsEditing(true);
    }

    async function loadPackages(trainerId: string) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("trainer_packages")
            .select("id, name, session_count, price, status")
            .eq("trainer_id", trainerId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Gagal mengambil paket trainer:", error);
            return;
        }

        setPackages(data ?? []);
    }

    async function loadSessionMembers(trainerId: string) {
        const supabase = createClient();

        const { data: relations, error: relationError } = await supabase
            .from("trainer_members")
            .select("member_id")
            .eq("trainer_id", trainerId);

        if (relationError) {
            console.error("Gagal mengambil member trainer:", relationError);
            return;
        }

        const memberIds = (relations ?? []).map((item) => item.member_id);

        if (memberIds.length === 0) {
            setMembers([]);
            return;
        }

        const { data: memberData, error: memberError } = await supabase
            .from("members")
            .select("id, name")
            .in("id", memberIds)
            .order("name");

        if (memberError) {
            console.error("Gagal mengambil data member:", memberError);
            return;
        }

        // Hanya mengambil paket yang masih aktif
        // dan masih memiliki sisa sesi.
        const { data: activePackages, error: packageError } = await supabase
            .from("trainer_package_members")
            .select("member_id, remaining_sessions")
            .eq("trainer_id", trainerId)
            .eq("status", "active")
            .gt("remaining_sessions", 0)
            .in("member_id", memberIds);

        if (packageError) {
            console.error(
                "Gagal mengambil paket aktif member:",
                packageError
            );
            return;
        }

        const activePackageMap = new Map(
            (activePackages ?? []).map((item) => [
                item.member_id,
                item.remaining_sessions,
            ])
        );

        const membersWithPackage = (memberData ?? []).map((member) => {
            const remainingSessions =
                activePackageMap.get(member.id) ?? 0;

            return {
                id: member.id,
                name: member.name,
                remaining_sessions: remainingSessions,
                has_active_package: remainingSessions > 0,
            };
        });

        setMembers(membersWithPackage);
    }

    async function loadAvailableMembers(trainerId: string) {
        const supabase = createClient();
        const branchId = getActiveBranchId();

        if (!branchId) {
            setAvailableMembers([]);
            return;
        }

        const { data: allMembers, error: memberError } = await supabase
            .from("members")
            .select("id, name")
            .eq("branch_id", branchId)
            .order("name");

        if (memberError) {
            console.error("Gagal mengambil daftar member:", memberError);
            return;
        }

        const { data: relations, error: relationError } = await supabase
            .from("trainer_members")
            .select("member_id")
            .eq("trainer_id", trainerId);

        if (relationError) {
            console.error(
                "Gagal mengambil hubungan member trainer:",
                relationError
            );
            return;
        }

        const assignedMemberIds = new Set(
            (relations ?? []).map((item) => item.member_id)
        );

        setAvailableMembers(
            (allMembers ?? []).filter(
                (member) => !assignedMemberIds.has(member.id)
            )
        );
    }

    async function addTrainerMember(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedMemberId) return;

        const trainerId = trainer?.id;

        if (!trainerId) {
            alert("Data trainer belum tersedia.");
            return;
        }

        setSavingMember(true);

        const supabase = createClient();

        const { error } = await supabase
            .from("trainer_members")
            .insert({
                trainer_id: trainerId,
                member_id: selectedMemberId,
                start_date: new Date().toISOString().split("T")[0],
            });

        if (error) {
            console.error("Gagal menambahkan member:", error);
            alert(error.message);
            setSavingMember(false);
            return;
        }

        setSelectedMemberId("");
        setIsMemberFormOpen(false);

        await loadSessionMembers(trainerId);
        await loadAvailableMembers(trainerId);

        setSavingMember(false);
    }

    async function removeTrainerMember(memberId: string) {
        const confirmed = window.confirm(
            "Hapus member ini dari daftar trainer?"
        );

        if (!confirmed) return;

        const trainerId = trainer?.id;

        if (!trainerId) {
            alert("Data trainer belum tersedia.");
            return;
        }

        const supabase = createClient();

        // Cek apakah member masih memiliki paket PT yang aktif
        // dan masih memiliki sisa sesi.
        const { data: activePackage, error: packageError } = await supabase
            .from("trainer_package_members")
            .select("id")
            .eq("trainer_id", trainerId)
            .eq("member_id", memberId)
            .eq("status", "active")
            .gt("remaining_sessions", 0)
            .limit(1)
            .maybeSingle();

        if (packageError) {
            console.error(
                "Gagal mengecek paket trainer member:",
                packageError
            );
            alert(packageError.message);
            return;
        }

        if (activePackage) {
            alert(
                "Member masih memiliki paket PT yang aktif dan memiliki sisa sesi. Member belum dapat dihapus dari trainer."
            );
            return;
        }

        // Jika tidak ada paket aktif yang tersisa,
        // hubungan member dengan trainer boleh dihapus.
        const { error } = await supabase
            .from("trainer_members")
            .delete()
            .eq("trainer_id", trainerId)
            .eq("member_id", memberId);

        if (error) {
            console.error("Gagal menghapus member dari trainer:", error);
            alert(error.message);
            return;
        }

        await loadSessionMembers(trainerId);
        await loadAvailableMembers(trainerId);
    }

    async function loadPackageMembers(trainerId: string) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("trainer_package_members")
            .select(`
            id,
            member_id,
            trainer_package_id,
            total_sessions,
            remaining_sessions,
            purchase_date,
            status,
            members (
                name
            ),
            trainer_packages (
                name
            )
        `)
            .eq("trainer_id", trainerId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Gagal mengambil paket member:", error);
            return;
        }

        const formattedData = (data ?? []).map((item: any) => ({
            id: item.id,
            member_id: item.member_id,
            trainer_package_id: item.trainer_package_id,
            total_sessions: item.total_sessions,
            remaining_sessions: item.remaining_sessions,
            purchase_date: item.purchase_date,
            status: item.status,
            member_name: item.members?.name ?? "-",
            package_name: item.trainer_packages?.name ?? "-",
        }));

        setPackageMembers(formattedData);
    }

    async function loadSessions(trainerId: string) {
        const supabase = createClient();

        const searchTerm = sessionSearch.trim().toLowerCase();

        let matchingMemberIds: string[] = [];

        if (searchTerm) {
            const { data: matchingMembers, error: memberSearchError } =
                await supabase
                    .from("members")
                    .select("id")
                    .ilike("name", `%${searchTerm}%`);

            if (memberSearchError) {
                console.error(
                    "Gagal mencari member:",
                    memberSearchError
                );
                return;
            }

            matchingMemberIds = (matchingMembers ?? []).map(
                (member) => member.id
            );
        }

        let query = supabase
            .from("trainer_sessions")
            .select(`
        id,
        member_id,
        visitor_name,
        session_date,
        price,
        payment_method,
        notes,
        created_at,
        trainer_package_member_id
    `)
            .eq("trainer_id", trainerId)
            .order("session_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (sessionStartDate) {
            query = query.gte("session_date", sessionStartDate);
        }

        if (sessionEndDate) {
            query = query.lte("session_date", sessionEndDate);
        }

        const hasDateFilter =
            Boolean(sessionStartDate) || Boolean(sessionEndDate);

        if (searchTerm) {
            const safeSearch = searchTerm.replace(/[,%()]/g, " ").trim();

            if (matchingMemberIds.length > 0) {
                query = query.or(
                    `visitor_name.ilike.%${safeSearch}%,member_id.in.(${matchingMemberIds.join(",")})`
                );
            } else {
                query = query.ilike(
                    "visitor_name",
                    `%${safeSearch}%`
                );
            }
        }

        if (!hasDateFilter) {
            query = query.limit(20);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Gagal mengambil riwayat sesi:", error);
            return;
        }

        const memberIds = (data ?? [])
            .map((item) => item.member_id)
            .filter((id): id is string => Boolean(id));

        let memberMap = new Map<string, string>();

        if (memberIds.length > 0) {
            const { data: memberData, error: memberError } =
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

            memberMap = new Map(
                (memberData ?? []).map((member) => [
                    member.id,
                    member.name,
                ])
            );
        }

        const formattedSessions = (data ?? []).map((item) => ({
            id: item.id,

            member_name: item.member_id
                ? memberMap.get(item.member_id) ?? "-"
                : item.visitor_name ?? "-",

            session_date: item.session_date,
            notes: item.notes,

            price: Number(item.price ?? 0),
            payment_method: item.payment_method,

            session_type: item.trainer_package_member_id
                ? ("package" as const)
                : ("single" as const),
        }));

        setSessions(formattedSessions);
    }

    async function addPackage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!packageName.trim()) {
            alert("Nama paket harus diisi.");
            return;
        }

        if (Number(packageSessionCount) <= 0) {
            alert("Jumlah sesi harus lebih dari 0.");
            return;
        }

        if (Number(packagePrice) < 0) {
            alert("Harga tidak boleh kurang dari 0.");
            return;
        }

        const { id } = await params;

        setSavingPackage(true);

        const supabase = createClient();

        const { error } = await supabase
            .from("trainer_packages")
            .insert({
                trainer_id: id,
                name: packageName.trim(),
                session_count: Number(packageSessionCount),
                price: Number(packagePrice),
                status: "active",
            });

        if (error) {
            console.error("Gagal menambahkan paket:", error);
            alert("Gagal menambahkan paket: " + error.message);
            setSavingPackage(false);
            return;
        }

        alert("Paket berhasil ditambahkan.");

        setPackageName("");
        setPackageSessionCount("");
        setPackagePrice("");
        setIsPackageFormOpen(false);

        await loadPackages(id);

        setSavingPackage(false);
    }

    function startEditPackage(item: TrainerPackage) {
        setEditingPackageId(item.id);
        setPackageName(item.name);
        setPackageSessionCount(String(item.session_count));
        setPackagePrice(String(item.price));
        setIsPackageFormOpen(true);
    }

    async function updatePackage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!editingPackageId) return;

        if (!packageName.trim()) {
            alert("Nama paket harus diisi.");
            return;
        }

        if (Number(packageSessionCount) <= 0) {
            alert("Jumlah sesi harus lebih dari 0.");
            return;
        }

        if (Number(packagePrice) < 0) {
            alert("Harga tidak boleh kurang dari 0.");
            return;
        }

        setSavingPackage(true);

        const supabase = createClient();

        const { error } = await supabase
            .from("trainer_packages")
            .update({
                name: packageName.trim(),
                session_count: Number(packageSessionCount),
                price: Number(packagePrice),
            })
            .eq("id", editingPackageId);

        if (error) {
            console.error("Gagal mengubah paket:", error);
            alert("Gagal mengubah paket: " + error.message);
            setSavingPackage(false);
            return;
        }

        const { id } = await params;

        await loadPackages(id);

        setEditingPackageId(null);
        setPackageName("");
        setPackageSessionCount("");
        setPackagePrice("");
        setIsPackageFormOpen(false);
        setSavingPackage(false);

        alert("Paket berhasil diperbarui.");
    }

    async function deactivatePackage(packageId: string) {
        const confirmed = confirm(
            "Yakin ingin menonaktifkan paket ini?"
        );

        if (!confirmed) return;

        const supabase = createClient();

        const { error } = await supabase
            .from("trainer_packages")
            .update({
                status: "inactive",
            })
            .eq("id", packageId);

        if (error) {
            console.error(
                "Gagal menonaktifkan paket:",
                error
            );
            alert(
                "Gagal menonaktifkan paket: " +
                error.message
            );
            return;
        }

        const { id } = await params;

        await loadPackages(id);

        alert("Paket berhasil dinonaktifkan.");
    }

    async function updateTrainer(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!trainer) return;

        setSaving(true);

        const supabase = createClient();
        const branchId = getActiveBranchId();

        if (!branchId) {
            alert("Cabang aktif belum dipilih.");
            setSaving(false);
            return;
        }

        const { error } = await supabase
            .from("trainers")
            .update({
                name,
                phone,
                specialization,
                price_per_session: Number(pricePerSession),
            })
            .eq("id", trainer.id)
            .eq("branch_id", branchId);

        if (error) {
            console.error("Gagal mengubah trainer:", error);
            alert(error.message);
            setSaving(false);
            return;
        }

        setTrainer({
            ...trainer,
            name,
            phone,
            specialization,
            price_per_session: Number(pricePerSession),
        });

        setIsEditing(false);
        setSaving(false);

        alert("Data trainer berhasil diperbarui.");
    }

    async function deactivateTrainer() {
        if (!trainer) return;

        const confirmed = window.confirm(
            "Yakin ingin menonaktifkan trainer ini?"
        );

        if (!confirmed) return;

        const supabase = createClient();
        const branchId = getActiveBranchId();

        if (!branchId) {
            alert("Cabang aktif belum dipilih.");
            return;
        }

        const { error } = await supabase
            .from("trainers")
            .update({
                status: "inactive",
            })
            .eq("id", trainer.id)
            .eq("branch_id", branchId);

        if (error) {
            console.error("Gagal menonaktifkan trainer:", error);
            alert(error.message);
            return;
        }

        setTrainer({
            ...trainer,
            status: "inactive",
        });

        alert("Trainer berhasil dinonaktifkan.");
    }

    async function addSession(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!sessionDate) {
            alert("Tanggal sesi harus diisi.");
            return;
        }

        if (sessionType === "package" && !sessionPackageMemberId) {
            alert("Paket member harus dipilih.");
            return;
        }

        if (
            sessionType === "single" &&
            sessionCustomerType === "member" &&
            !sessionMemberId
        ) {
            alert("Member harus dipilih.");
            return;
        }

        if (
            sessionType === "single" &&
            sessionCustomerType === "non-member" &&
            !sessionVisitorName.trim()
        ) {
            alert("Nama pelanggan harus diisi.");
            return;
        }

        setSavingSession(true);

        try {
            const supabase = createClient();

            const { id } = await params;

            let error;

            if (sessionType === "package") {
                // Gunakan sesi dari paket yang sudah dibeli.
                const result = await supabase.rpc(
                    "use_trainer_session",
                    {
                        p_trainer_package_member_id:
                            sessionPackageMemberId,
                        p_session_date: sessionDate,
                        p_notes: sessionNotes,
                    }
                );

                error = result.error;
            } else {
                // Bayar per sesi.
                // RPC akan membuat transaksi + trainer session.
                const result = await supabase.rpc(
                    "create_trainer_single_session",
                    {
                        p_trainer_id: id,
                        p_member_id:
                            sessionCustomerType === "member"
                                ? sessionMemberId
                                : null,
                        p_visitor_name:
                            sessionCustomerType === "non-member"
                                ? sessionVisitorName.trim()
                                : null,
                        p_session_date: sessionDate,
                        p_payment_method: sessionPaymentMethod,
                        p_notes: sessionNotes,
                    }
                );

                error = result.error;
            }

            if (error) {
                console.error("Gagal mencatat sesi:", error);
                console.error("Error message:", error.message);
                console.error("Error details:", error.details);
                console.error("Error hint:", error.hint);
                console.error("Error code:", error.code);

                alert(
                    "Gagal mencatat sesi:\n" +
                    (error.message || "Terjadi error yang tidak diketahui.")
                );

                return;
            }

            // Refresh data setelah berhasil.
            await loadPackageMembers(id);
            await loadSessions(id);
            await loadSessionMembers(id);

            // Reset form.
            setSessionType("package");
            setSessionPackageMemberId("");
            setSessionMemberId("");
            setSessionPaymentMethod("cash");
            setSessionDate("");
            setSessionNotes("");
            setIsSessionFormOpen(false);

            alert("Sesi berhasil dicatat.");
        } finally {
            setSavingSession(false);
        }
    }

    async function purchasePackage(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!purchaseMemberId || !purchasePackageId) {
            alert("Member dan paket harus dipilih.");
            return;
        }

        setSavingPurchase(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.rpc(
                "purchase_trainer_package",
                {
                    p_trainer_package_id: purchasePackageId,
                    p_member_id: purchaseMemberId,
                    p_payment_method: purchasePaymentMethod,
                    p_purchase_date: purchaseDate,
                    p_notes: purchaseNotes,
                }
            );

            if (error) {
                console.error("Gagal membeli paket:", error);
                alert("Gagal membeli paket: " + error.message);
                return;
            }

            const { id } = await params;

            await loadPackageMembers(id);

            setPurchaseMemberId("");
            setPurchasePackageId("");
            setPurchaseDate("");
            setPurchasePaymentMethod("");
            setPurchaseNotes("");
            setIsPurchaseFormOpen(false);

            alert("Paket berhasil dibeli.");
        } finally {
            setSavingPurchase(false);
        }
    }

    async function cancelPackageMember(packageMemberId: string) {
        const confirmed = window.confirm(
            "Batalkan paket member ini? Paket yang sudah digunakan tidak dapat dibatalkan."
        );

        if (!confirmed) return;

        const supabase = createClient();

        const { error } = await supabase.rpc(
            "cancel_trainer_package_member",
            {
                p_trainer_package_member_id: packageMemberId,
            }
        );

        if (error) {
            console.error("Gagal membatalkan paket:", error);
            alert(error.message);
            return;
        }

        if (trainer) {
            await loadPackageMembers(trainer.id);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 p-8 text-black">
            <button
                onClick={() => window.history.back()}
                className="mb-6 text-sm text-gray-600 hover:text-black"
            >
                ← Kembali
            </button>

            <div className="rounded-xl bg-white p-6 shadow">
                <h1 className="text-3xl font-bold">{trainer.name}</h1>

                <div className="mt-5 space-y-2">
                    <p>
                        <span className="font-medium">Nomor HP:</span>{" "}
                        {trainer.phone}
                    </p>

                    <p>
                        <span className="font-medium">Spesialisasi:</span>{" "}
                        {trainer.specialization}
                    </p>

                    <p>
                        <span className="font-medium">Harga per sesi:</span>{" "}
                        Rp{trainer.price_per_session.toLocaleString("id-ID")}
                    </p>

                    <p>
                        <span className="font-medium">Status:</span>{" "}
                        {trainer.status === "active"
                            ? "Aktif"
                            : "Tidak Aktif"}
                    </p>
                </div>

                <div className="mt-6">
                    <button
                        onClick={startEditing}
                        className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 mr-1"
                    >
                        Edit Trainer
                    </button>

                    <button
                        type="button"
                        onClick={deactivateTrainer}
                        disabled={trainer.status === "inactive"}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300 ml-1"
                    >
                        {trainer.status === "inactive"
                            ? "Trainer Tidak Aktif"
                            : "Nonaktifkan Trainer"}
                    </button>
                </div>

                {isEditing && (
                    <div className="mt-6 rounded-xl bg-white p-6 shadow">
                        <h2 className="text-xl font-bold">
                            Edit Trainer
                        </h2>

                        <form
                            onSubmit={updateTrainer}
                            className="mt-5 space-y-4"
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Nama Trainer
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full rounded-lg border p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Nomor HP
                                </label>

                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full rounded-lg border p-3"
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
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Harga per Sesi
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={pricePerSession}
                                    onChange={(e) =>
                                        setPricePerSession(e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border p-3"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white"
                                >
                                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="rounded-lg border px-4 py-2"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Member yang Ditangani
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Daftar member yang ditangani oleh trainer ini.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700">
                            {members.length} Member
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedMemberId("");
                                setIsMemberFormOpen(true);

                                if (trainer) {
                                    loadAvailableMembers(trainer.id);
                                }
                            }}
                            disabled={trainer.status === "inactive"}
                            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            + Tambah Member
                        </button>
                    </div>
                </div>

                {isMemberFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <form
                            onSubmit={addTrainerMember}
                            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-zinc-900">
                                    Tambah Member ke Trainer
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => setIsMemberFormOpen(false)}
                                    className="text-xl text-zinc-400 hover:text-zinc-600"
                                    aria-label="Tutup"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mt-5">
                                <label className="text-sm text-zinc-600">
                                    Pilih Member
                                </label>

                                <select
                                    value={selectedMemberId}
                                    onChange={(e) =>
                                        setSelectedMemberId(e.target.value)
                                    }
                                    required
                                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="">
                                        Pilih Member
                                    </option>

                                    {availableMembers.map((member) => (
                                        <option
                                            key={member.id}
                                            value={member.id}
                                        >
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsMemberFormOpen(false)}
                                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingMember}
                                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {savingMember ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {members.length === 0 ? (
                    <p className="mt-5 py-6 text-center text-sm text-zinc-500">
                        Belum ada member yang ditangani.
                    </p>
                ) : (
                    <div className="mt- overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 text-zinc-500">
                                    <th className="py-3 font-medium">
                                        No
                                    </th>

                                    <th className="py-3 font-medium">
                                        Nama Member
                                    </th>

                                    <th className="py-3 font-medium">
                                        Status Paket
                                    </th>

                                    <th className="py-3 text-right font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {members.map((member, index) => (
                                    <tr
                                        key={member.id}
                                        className="border-b border-zinc-100"
                                    >
                                        <td>{index + 1}</td>

                                        <td>{member.name}</td>

                                        <td>
                                            {member.has_active_package ? (
                                                <span className="text-sm text-zinc-700">
                                                    {member.remaining_sessions} sesi tersisa
                                                </span>
                                            ) : (
                                                <span className="text-sm text-zinc-500">
                                                    Tidak ada paket aktif
                                                </span>
                                            )}
                                        </td>

                                        <td className="text-right">
                                            {member.remaining_sessions > 0 ? (
                                                <span className="text-sm text-zinc-400">
                                                    Tidak dapat dihapus
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTrainerMember(member.id)}
                                                    disabled={trainer.status === "inactive"}
                                                    className="text-sm font-medium text-red-600 hover:text-red-700">
                                                    Hapus
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Paket Sesi
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Daftar paket sesi yang tersedia untuk trainer ini.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEditingPackageId(null);
                            setPackageName("");
                            setPackageSessionCount("");
                            setPackagePrice("");
                            setIsPackageFormOpen(true);
                        }}
                        disabled={trainer.status === "inactive"}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        + Tambah Paket
                    </button>
                </div>

                {isPackageFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <form
                            onSubmit={editingPackageId ? updatePackage : addPackage}
                            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-zinc-900">
                                    {editingPackageId
                                        ? "Edit Paket Sesi"
                                        : "Tambah Paket Sesi"}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => setIsPackageFormOpen(false)}
                                    className="text-xl text-zinc-400 hover:text-zinc-600"
                                    aria-label="Tutup"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="text-sm text-zinc-600">
                                        Nama Paket
                                    </label>

                                    <input
                                        type="text"
                                        value={packageName}
                                        onChange={(e) =>
                                            setPackageName(e.target.value)
                                        }
                                        placeholder="Contoh: Paket 5 Sesi"
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-600">
                                        Jumlah Sesi
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={packageSessionCount}
                                        onChange={(e) =>
                                            setPackageSessionCount(e.target.value)
                                        }
                                        placeholder="5"
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-600">
                                        Harga
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={packagePrice}
                                        onChange={(e) =>
                                            setPackagePrice(e.target.value)
                                        }
                                        placeholder="450000"
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPackageFormOpen(false)}
                                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingPackage}
                                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {savingPackage
                                        ? "Menyimpan..."
                                        : editingPackageId
                                            ? "Simpan Perubahan"
                                            : "Simpan Paket"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mt-5 space-y-3">
                    {packages.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                            Belum ada paket sesi.
                        </p>
                    ) : (
                        packages.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4"
                            >
                                <div>
                                    <p className="font-medium text-zinc-900">
                                        {item.name}
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-500">
                                        {item.session_count} sesi
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-semibold text-zinc-900">
                                            Rp {item.price.toLocaleString("id-ID")}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {item.status === "active" ? "Aktif" : "Nonaktif"}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => startEditPackage(item)}
                                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                                    >
                                        Edit
                                    </button>

                                    {item.status === "active" && (
                                        <button
                                            type="button"
                                            onClick={() => deactivatePackage(item.id)}
                                            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Nonaktifkan
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Sesi Trainer
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Catat sesi latihan member bersama trainer.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setSessionType("package");
                            setSessionPackageMemberId("");
                            setSessionMemberId("");
                            setSessionCustomerType("member");
                            setSessionVisitorName("");
                            setSessionPaymentMethod("cash");
                            setSessionDate(
                                new Date().toISOString().split("T")[0]
                            );
                            setSessionNotes("");
                            setIsSessionFormOpen(true);
                        }}
                        disabled={trainer.status === "inactive"}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        + Catat Sesi
                    </button>
                </div>

                <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Riwayat Sesi
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Riwayat sesi latihan member bersama trainer.
                        </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-end gap-3">

                        <div className="min-w-[220px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-zinc-600">
                                Cari pelanggan
                            </label>

                            <input
                                type="text"
                                value={sessionSearch}
                                onChange={(e) => setSessionSearch(e.target.value)}
                                placeholder="Nama member atau non-member..."
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-600">
                                Dari
                            </label>

                            <input
                                type="date"
                                value={sessionStartDate}
                                onChange={(e) => setSessionStartDate(e.target.value)}
                                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-600">
                                Sampai
                            </label>

                            <input
                                type="date"
                                value={sessionEndDate}
                                onChange={(e) => setSessionEndDate(e.target.value)}
                                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-500"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                await loadSessions(trainer.id,);
                            }}
                            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
                            Terapkan
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                setSessionStartDate("");
                                setSessionEndDate("");

                                const supabase = createClient();

                                const { id } = await params;

                                await loadSessions(id);
                            }}
                            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="mt-5 max-h-80 overflow-x-auto">
                        {sessions.length === 0 ? (
                            <p className="text-sm text-zinc-500">
                                Belum ada riwayat sesi.
                            </p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 text-zinc-500">
                                        <th className="px-3 py-3 font-medium">
                                            No
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Pelanggan
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Jenis
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Tanggal Sesi
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Harga
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Pembayaran
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Catatan
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sessions.map((session, index) => (
                                        <tr
                                            key={session.id}
                                            className="border-b border-zinc-100"
                                        >
                                            <td className="px-3 py-3 text-zinc-600">
                                                {index + 1}
                                            </td>

                                            <td className="px-3 py-3 font-medium text-zinc-900">
                                                {session.member_name}
                                            </td>

                                            <td className="px-3 py-3 text-zinc-600">
                                                {session.session_type === "package"
                                                    ? "Paket"
                                                    : "Per Sesi"}
                                            </td>

                                            <td className="px-3 py-3 text-zinc-600">
                                                {new Date(
                                                    session.session_date
                                                ).toLocaleDateString("id-ID")}
                                            </td>

                                            <td className="px-3 py-3 text-zinc-600">
                                                Rp{" "}
                                                {Number(
                                                    session.price
                                                ).toLocaleString("id-ID")}
                                            </td>

                                            <td className="px-3 py-3 text-zinc-600">
                                                {session.payment_method
                                                    ? session.payment_method.toUpperCase()
                                                    : "-"}
                                            </td>

                                            <td className="px-3 py-3 text-zinc-600">
                                                {session.notes || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {isSessionFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <form
                            onSubmit={addSession}
                            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-zinc-900">
                                    Catat Sesi Trainer
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => setIsSessionFormOpen(false)}
                                    className="text-xl text-zinc-400 hover:text-zinc-600"
                                    aria-label="Tutup"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mt-5">
                                <label className="text-sm text-zinc-600">
                                    Jenis Sesi
                                </label>

                                <select
                                    value={sessionType}
                                    onChange={(e) => {
                                        const value = e.target.value as "package" | "single";

                                        setSessionType(value);
                                        setSessionPackageMemberId("");
                                        setSessionMemberId("");
                                    }}
                                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="package">
                                        Gunakan Paket Member
                                    </option>

                                    <option value="single">
                                        Bayar Per Sesi
                                    </option>
                                </select>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {sessionType === "package" && (
                                    <div>
                                        <label className="text-sm text-zinc-600">
                                            Paket Member
                                        </label>

                                        <select
                                            value={sessionPackageMemberId}
                                            onChange={(e) =>
                                                setSessionPackageMemberId(e.target.value)
                                            }
                                            required
                                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                        >
                                            <option value="">
                                                Pilih Paket Member
                                            </option>

                                            {activePackageMembers.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.member_name} - {item.remaining_sessions} sesi tersisa
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {sessionType === "single" && (
                                    <>
                                        <div>
                                            <label className="text-sm text-zinc-600">
                                                Tipe Pelanggan
                                            </label>

                                            <select
                                                value={sessionCustomerType}
                                                onChange={(e) => {
                                                    const value = e.target.value as
                                                        | "member"
                                                        | "non-member";

                                                    setSessionCustomerType(value);
                                                    setSessionMemberId("");
                                                    setSessionVisitorName("");
                                                }}
                                                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                            >
                                                <option value="member">
                                                    Member
                                                </option>

                                                <option value="non-member">
                                                    Non-member
                                                </option>
                                            </select>
                                        </div>

                                        {sessionCustomerType === "member" ? (
                                            <div>
                                                <label className="text-sm text-zinc-600">
                                                    Member
                                                </label>

                                                <select
                                                    value={sessionMemberId}
                                                    onChange={(e) =>
                                                        setSessionMemberId(e.target.value)
                                                    }
                                                    required
                                                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="">
                                                        Pilih Member
                                                    </option>

                                                    {members.map((member) => (
                                                        <option
                                                            key={member.id}
                                                            value={member.id}
                                                        >
                                                            {member.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-sm text-zinc-600">
                                                    Nama Pelanggan
                                                </label>

                                                <input
                                                    type="text"
                                                    value={sessionVisitorName}
                                                    onChange={(e) =>
                                                        setSessionVisitorName(e.target.value)
                                                    }
                                                    required
                                                    placeholder="Masukkan nama pelanggan"
                                                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-sm text-zinc-600">
                                                Harga Per Sesi
                                            </label>

                                            <div className="mt-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                                                Rp{" "}
                                                {Number(
                                                    trainer?.price_per_session ?? 0
                                                ).toLocaleString("id-ID")}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm text-zinc-600">
                                                Metode Pembayaran
                                            </label>

                                            <select
                                                value={sessionPaymentMethod}
                                                onChange={(e) =>
                                                    setSessionPaymentMethod(e.target.value)
                                                }
                                                required
                                                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="qris">QRIS</option>
                                                <option value="transfer">
                                                    Transfer
                                                </option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-sm text-zinc-600">
                                        Tanggal Sesi
                                    </label>

                                    <input
                                        type="date"
                                        value={sessionDate}
                                        onChange={(e) => setSessionDate(e.target.value)}
                                        required
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm text-zinc-600">
                                        Catatan
                                    </label>

                                    <textarea
                                        value={sessionNotes}
                                        onChange={(e) =>
                                            setSessionNotes(e.target.value)
                                        }
                                        rows={3}
                                        placeholder="Catatan sesi (opsional)"
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            {sessionType === "single" && (
                                <>

                                </>
                            )}

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSessionFormOpen(false)}
                                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingSession}
                                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {savingSession
                                        ? "Menyimpan..."
                                        : "Simpan Sesi"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Paket Member
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Daftar paket PT yang dimiliki member.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setPurchaseMemberId("");
                            setPurchasePackageId("");
                            setPurchaseDate(
                                new Date().toISOString().split("T")[0]
                            );
                            setPurchasePaymentMethod("");
                            setPurchaseNotes("");
                            setIsPurchaseFormOpen(true);
                        }}
                        disabled={trainer.status === "inactive"}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        + Beli Paket
                    </button>
                </div>

                {isPurchaseFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <form
                            onSubmit={purchasePackage}
                            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-zinc-900">
                                    Beli Paket Member
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => setIsPurchaseFormOpen(false)}
                                    className="text-xl text-zinc-400 hover:text-zinc-600"
                                    aria-label="Tutup"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm text-zinc-600">
                                        Member
                                    </label>

                                    <select
                                        value={purchaseMemberId}
                                        onChange={(e) =>
                                            setPurchaseMemberId(e.target.value)
                                        }
                                        required
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            Pilih Member
                                        </option>

                                        {members.map((member) => (
                                            <option
                                                key={member.id}
                                                value={member.id}
                                            >
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-600">
                                        Paket Trainer
                                    </label>

                                    <select
                                        value={purchasePackageId}
                                        onChange={(e) =>
                                            setPurchasePackageId(e.target.value)
                                        }
                                        required
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            Pilih Paket
                                        </option>

                                        {packages
                                            .filter(
                                                (item) =>
                                                    item.status === "active"
                                            )
                                            .map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name} -{" "}
                                                    {item.session_count} sesi - Rp{" "}
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString("id-ID")}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-600">
                                        Tanggal Pembelian
                                    </label>

                                    <input
                                        type="date"
                                        value={purchaseDate}
                                        onChange={(e) =>
                                            setPurchaseDate(e.target.value)
                                        }
                                        required
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-600">
                                        Metode Pembayaran
                                    </label>

                                    <select
                                        value={purchasePaymentMethod}
                                        onChange={(e) =>
                                            setPurchasePaymentMethod(
                                                e.target.value
                                            )
                                        }
                                        required
                                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="qris">QRIS</option>
                                        <option value="transfer">
                                            Transfer
                                        </option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm text-zinc-600">
                                        Catatan
                                    </label>

                                    <textarea
                                        value={purchaseNotes}
                                        onChange={(e) =>
                                            setPurchaseNotes(e.target.value)
                                        }
                                        rows={3}
                                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                                        placeholder="Catatan pembelian (opsional)"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsPurchaseFormOpen(false)
                                    }
                                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingPurchase}
                                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {savingPurchase
                                        ? "Menyimpan..."
                                        : "Beli Paket"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mt-5 space-y-6">
                    {/* Paket aktif */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-medium text-zinc-900">
                                Paket Member Aktif
                            </h3>

                            <span className="text-sm text-zinc-500">
                                {activePackageMembers.length} paket
                            </span>
                        </div>

                        {activePackageMembers.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center">
                                <p className="text-sm text-zinc-500">
                                    Belum ada paket member yang aktif.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activePackageMembers.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-zinc-200 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-zinc-900">
                                                    {item.member_name}
                                                </p>

                                                <p className="mt-1 text-sm text-zinc-500">
                                                    {item.package_name}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-medium text-zinc-900">
                                                    {item.remaining_sessions} /{" "}
                                                    {item.total_sessions} sesi
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    Dibeli:{" "}
                                                    {new Date(
                                                        item.purchase_date
                                                    ).toLocaleDateString("id-ID")}
                                                </p>

                                                {item.remaining_sessions === item.total_sessions && (
                                                    <button
                                                        type="button"
                                                        onClick={() => cancelPackageMember(item.id)}
                                                        className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                                                    >
                                                        Batalkan Paket
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Riwayat paket */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-medium text-zinc-900">
                                Riwayat Paket Member
                            </h3>

                            <span className="text-sm text-zinc-500">
                                {completedPackageMembers.length} paket
                            </span>
                        </div>

                        {completedPackageMembers.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center">
                                <p className="text-sm text-zinc-500">
                                    Belum ada paket yang selesai.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                                {completedPackageMembers.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-zinc-900">
                                                    {item.member_name}
                                                </p>

                                                <p className="mt-1 text-sm text-zinc-500">
                                                    {item.package_name}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-medium text-zinc-700">
                                                    {item.remaining_sessions} /{" "}
                                                    {item.total_sessions} sesi
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {item.status === "cancelled" ? "Dibatalkan" : "Selesai"}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="mt-2 text-xs text-zinc-500">
                                            Dibeli:{" "}
                                            {new Date(
                                                item.purchase_date
                                            ).toLocaleDateString("id-ID")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}