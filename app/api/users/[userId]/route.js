
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/backend";

export async function DELETE(
  request,
  { params }
) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Asal permintaan tidak valid" }, { status: 403 });
  }
  const { userId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    return NextResponse.json({ message: "ID pengguna tidak valid" }, { status: 400 });
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("apd_access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Sesi login tidak ditemukan" },
      { status: 401 }
    );
  }

  // Periksa hak admin berdasarkan token, bukan input dari browser.
  const apiUrl = getBackendUrl();

  try {
    const profileResponse = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!profileResponse.ok) {
      return NextResponse.json(
        { message: "Sesi tidak valid" },
        { status: 401 }
      );
    }

    const currentUser = await profileResponse.json();

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "Akses hanya untuk admin" },
        { status: 403 }
      );
    }

    if (currentUser.id === userId) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus akun sendiri" },
        { status: 403 }
      );
    }

    const response = await fetch(
      `${apiUrl}/users/${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      const result = await response.json().catch(() => null);

      const message =
        typeof result?.detail === "string"
          ? result.detail
          : "Gagal menghapus pengguna";

      return NextResponse.json(
        { message },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Pengguna berhasil dihapus",
    });
  } catch {
    return NextResponse.json(
      { message: "Gagal menghubungi backend" },
      { status: 502 }
    );
  }
}
