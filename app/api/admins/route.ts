import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Cek user yang sedang login
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Anda belum login." },
        { status: 401 }
      );
    }

    // Cek role user
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "super_admin") {
      return NextResponse.json(
        { error: "Akses hanya untuk Super Admin." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { name, email, password, branch_id } = body;

    if (!name || !email || !password || !branch_id) {
      return NextResponse.json(
        { error: "Semua data Admin wajib diisi." },
        { status: 400 }
      );
    }

    // Service role hanya digunakan di server
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Pastikan cabang benar-benar ada
    const { data: branch, error: branchError } = await supabaseAdmin
      .from("branches")
      .select("id")
      .eq("id", branch_id)
      .single();

    if (branchError || !branch) {
      return NextResponse.json(
        { error: "Cabang tidak ditemukan." },
        { status: 400 }
      );
    }

    // Buat akun Auth
    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Akun Admin gagal dibuat." },
        { status: 500 }
      );
    }

    // Buat profil Admin
    const { error: profileInsertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        name,
        email,
        role: "admin",
        branch_id,
      });

    if (profileInsertError) {
      // Kalau profil gagal dibuat, akun Auth juga dibatalkan
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: profileInsertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin berhasil dibuat.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}