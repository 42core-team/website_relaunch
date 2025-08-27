'use server';
import axiosInstance from "@/app/actions/axios";

export interface MatchStats {
    actionsExecuted?: string,
    damageDeposits?: string,
    gempilesDestroyed?: string,
    damageTotal?: string,
    gemsGained?: string,
    damageWalls?: string,
    damageCores?: string,
    unitsSpawned?: string,
    tilesTraveled?: string,
    damageSelf?: string,
    damageUnits?: string,
    wallsDestroyed?: string,
    gemsTransferred?: string,
    unitsDestroyed?: string,
    coresDestroyed?: string,
    damageOpponent?: string
}

export async function getGlobalStats(): Promise<MatchStats> {
    return (await axiosInstance.get<MatchStats>('stats/global')).data;
}