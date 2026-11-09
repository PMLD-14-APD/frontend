
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend";

function backendMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "detail" in data && typeof data.detail === "string") {
    return data.detail;
  }
  return fallback;
}

export async function POST(request: NextRequest) {
  const API_URL = getBackendUrl();
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Format permintaan tidak valid" }, { status: 400 });
  }
  try {
    const { username, password } = payload ?? {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.set("username", username.trim());
    formData.set("password", password);

    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!loginResponse.ok) {
      const detail: unknown = await loginResponse.json().catch(() => null);
      return NextResponse.json(
        { message: backendMessage(detail, "Login gagal. Silakan coba lagi.") },
        { status: loginResponse.status >= 500 ? 502 : loginResponse.status }
      );
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    if (typeof token !== "string" || !token) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 502 }
      );
    }

    // Validasi token dan ambil profil pengguna.
    const profileResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!profileResponse.ok) {
      const detail: unknown = await profileResponse.json().catch(() => null);
      return NextResponse.json(
        { message: backendMessage(detail, "Gagal memverifikasi akun") },
        { status: [401, 403].includes(profileResponse.status) ? profileResponse.status : 502 }
      );
    }

    const user = await profileResponse.json();

    const response = NextResponse.json({
      message: "Login berhasil",
      user,
    }, { headers: { "Cache-Control": "no-store" } });

    // Simpan token di cookie HttpOnly, bukan localStorage.
    response.cookies.set("apd_access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Tidak dapat terhubung ke server" },
      { status: 502 }
    );
  }
}
