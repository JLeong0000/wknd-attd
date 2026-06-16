import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface PersonData {
    id: string;
    name: string;
    status: string;
}

export interface Group {
    key: string;
    label: string;
    sort_order: number;
}

export type ChangeBuffer = {
    timer: NodeJS.Timeout | null;
    payloads: RealtimePostgresChangesPayload<{ [key: string]: any }>[];
    origin: boolean;
};
