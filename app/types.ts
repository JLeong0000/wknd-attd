import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface PersonData {
    id: string;
    name: string;
    status: string;
}

export type ChangeBuffer = {
    timer: NodeJS.Timeout | null;
    payloads: RealtimePostgresChangesPayload<{ [key: string]: any }>[];
    origin: boolean;
};
