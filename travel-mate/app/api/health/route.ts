import { NextResponse } from "next/server";

export async function GET() {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  const mapTokenConfigured = Boolean(process.env.MAPBOX_API_KEY);

  const payload = {
    status: dbConfigured && mapTokenConfigured ? "ok" : "missing-config",
    app: "travel-mate",
    env: process.env.NEXT_PUBLIC_ENV ?? "unknown",
    checks: {
      databaseUrlPresent: dbConfigured,
      mapTokenPresent: mapTokenConfigured,
    },
  };

  return NextResponse.json(payload, {
    status: dbConfigured && mapTokenConfigured ? 200 : 500,
  });
}
