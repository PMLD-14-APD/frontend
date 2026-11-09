
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logout berhasil",
  });

  response.cookies.delete("apd_access_token");

  return response;
}
