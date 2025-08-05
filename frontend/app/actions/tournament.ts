"use server";

import axiosInstance from "@/app/actions/axios";
import { Match } from "@/app/actions/tournament-model";

export async function getSwissMatches(eventId: string) {
  return (await axiosInstance.get(`/match/swiss/${eventId}`)).data as Match[];
}

export async function createSwissMatches(eventId: string) {
  return (await axiosInstance.put(`/match/swiss/${eventId}`)).data;
}

// Functions:
// General:
// - Increase round!!!!!!!!!
// -- subfunctions for: increase swiss round, increase elimination round, change phases,
// - Get current round
// - Get max rounds
//
//
// Swiss:
//
// Bracket:
// Consistent function for initial team bracket assignment
//

// Client side:
// Swiss:
// - Always Render Labels (Round number)
//
// Bracket:
// - Render Tree function (variable based on single / double elimination)
// - Display progression based on winners of initial state
