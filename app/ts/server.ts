import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";

import { PersonData } from "../types";
import { generateId } from "./helper";

export const runtime = "edge"; // Use Edge Runtime

async function getPeople() {
    try {
        const res = await fetch("https://wknd-attd.vercel.app/people");
        const people = await res.json();
        return people;
    } catch (error) {
        console.error("Error fetching people", error);
    }
}

async function postCurrentPpl(data?: PersonData[]) {
    console.log("Pending postCurrentPpl implementation");
}

async function postDefaultPpl(data?: PersonData[]) {
    console.log("Pending postDefaultPpl implementation");
}

export { getPeople, postCurrentPpl, postDefaultPpl };
