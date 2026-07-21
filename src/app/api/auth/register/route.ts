import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "Publiczna rejestracja jest wyłączona. Konto może utworzyć wyłącznie administrator systemu.",
    },
    { status: 403 },
  );
}
