import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";

import { PersonData } from "../types";
import { generateId } from "./helper";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

async function getPeople() {
    try {
        const res = await fetch(`${baseUrl}/people`);
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
