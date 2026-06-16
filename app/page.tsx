"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGroups } from "./ts/server";
import { Group } from "./types";
import Attendance from "./components/Attendance";
import GroupPicker from "./components/GroupPicker";
import InstallPrompt from "./components/InstallPrompt";

const STORAGE_KEY = "wknd-attd:selectedGroup";

const HomeInner: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [resolved, setResolved] = useState(false);

    useEffect(() => {
        const urlKey = searchParams.get("group");

        getGroups().then(groups => {
            const find = (key: string | null) => groups.find(g => g.key === key) ?? null;

            // URL param takes priority, then cached selection
            const fromUrl = find(urlKey);
            if (fromUrl) {
                setActiveGroup(fromUrl);
                setResolved(true);
                return;
            }

            const cached = localStorage.getItem(STORAGE_KEY);
            const fromCache = find(cached);
            if (fromCache) {
                setActiveGroup(fromCache);
                router.replace(`/?group=${fromCache.key}`);
                setResolved(true);
                return;
            }

            // No valid selection — show the picker
            setResolved(true);
        });
    }, [searchParams, router]);

    const handleSelect = (group: Group) => {
        localStorage.setItem(STORAGE_KEY, group.key);
        router.replace(`/?group=${group.key}`);
        setActiveGroup(group);
    };

    const handleSwitchGroup = () => {
        localStorage.removeItem(STORAGE_KEY);
        router.replace("/");
        setActiveGroup(null);
    };

    if (!resolved) return null;

    if (!activeGroup) {
        return (
            <>
                <GroupPicker onSelect={handleSelect} />
                <InstallPrompt />
            </>
        );
    }

    return (
        <>
            <Attendance
                groupKey={activeGroup.key}
                groupLabel={activeGroup.label}
                onSwitchGroup={handleSwitchGroup}
            />
            <InstallPrompt />
        </>
    );
};

const Home: React.FC = () => (
    <Suspense>
        <HomeInner />
    </Suspense>
);

export default Home;
