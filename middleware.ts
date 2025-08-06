import { NextResponse } from "next/server";
import { getAll } from "@vercel/edge-config";

export const config = { matcher: "/people" };

export async function middleware() {
    const config = await getAll();

    return NextResponse.json({
        currentPeople: config.currentPeople,
        defaultPeople: config.defaultPeople,
        settings: config.settings,
    });
}
