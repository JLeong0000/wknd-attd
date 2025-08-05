import { PersonData } from "../types";
import { generateId } from "./helper";

async function getCurrentPpl() {
    return [
        {
            id: generateId(),
            name: "John Doe",
            status: "Serving",
        },
        {
            id: generateId(),
            name: "Jane Smith",
            status: "Core",
        },
    ];
}

async function getDefaultPpl() {
    return [
        {
            id: generateId(),
            name: "Michael Johnson",
            status: "Sitting",
        },
        {
            id: generateId(),
            name: "Emily Davis",
            status: "Others",
        },
    ];
}

async function postCurrentPpl(data?: PersonData[]) {
    console.log("Pending postCurrentPpl implementation");
}

async function postDefaultPpl(data?: PersonData[]) {
    console.log("Pending postDefaultPpl implementation");
}

export { getCurrentPpl, postCurrentPpl, getDefaultPpl, postDefaultPpl };
