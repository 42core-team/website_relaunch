-- CreateEnum
CREATE TYPE "events_state_enum" AS ENUM ('TEAM_FINDING', 'CODING_PHASE', 'SWISS_ROUND', 'ELIMINATION_ROUND', 'FINISHED');

-- CreateEnum
CREATE TYPE "events_type_enum" AS ENUM ('REGULAR', 'RUSH');

-- CreateEnum
CREATE TYPE "matches_state_enum" AS ENUM ('PLANNED', 'READY', 'ONGOING', 'FINISHED');

-- CreateEnum
CREATE TYPE "matches_phase_enum" AS ENUM ('SWISS', 'ELIMINATION');

-- CreateEnum
CREATE TYPE "user_event_permissions_role_enum" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "githubAccessToken" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePicture" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canCreateEvent" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "minTeamSize" INTEGER NOT NULL,
    "maxTeamSize" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "state" "events_state_enum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "events_type_enum" NOT NULL,
    "repoTemplateOwner" TEXT NOT NULL,
    "repoTemplateName" TEXT NOT NULL,
    "treeFormat" INTEGER NOT NULL,
    "currentRound" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventUser" (
    "eventsId" TEXT NOT NULL,
    "usersId" TEXT NOT NULL,

    CONSTRAINT "EventUser_pkey" PRIMARY KEY ("eventsId","usersId")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "state" "matches_state_enum" NOT NULL,
    "round" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phase" "matches_phase_enum" NOT NULL,
    "winnerId" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchesTeams" (
    "matchesId" TEXT NOT NULL,
    "teamsId" TEXT NOT NULL,

    CONSTRAINT "MatchesTeams_pkey" PRIMARY KEY ("matchesId","teamsId")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "repo" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "buchholzPoints" INTEGER NOT NULL,
    "hadBye" BOOLEAN NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInviteUser" (
    "teamsId" TEXT NOT NULL,
    "usersId" TEXT NOT NULL,

    CONSTRAINT "TeamInviteUser_pkey" PRIMARY KEY ("teamsId","usersId")
);

-- CreateTable
CREATE TABLE "TeamUser" (
    "teamsId" TEXT NOT NULL,
    "usersId" TEXT NOT NULL,

    CONSTRAINT "TeamUser_pkey" PRIMARY KEY ("teamsId","usersId")
);

-- CreateTable
CREATE TABLE "UserEventPermission" (
    "id" TEXT NOT NULL,
    "role" "user_event_permissions_role_enum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "UserEventPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Match_round_idx" ON "Match"("round");

-- CreateIndex
CREATE UNIQUE INDEX "UserEventPermission_userId_eventId_key" ON "UserEventPermission"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "EventUser" ADD CONSTRAINT "EventUser_eventsId_fkey" FOREIGN KEY ("eventsId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventUser" ADD CONSTRAINT "EventUser_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchesTeams" ADD CONSTRAINT "MatchesTeams_matchesId_fkey" FOREIGN KEY ("matchesId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchesTeams" ADD CONSTRAINT "MatchesTeams_teamsId_fkey" FOREIGN KEY ("teamsId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInviteUser" ADD CONSTRAINT "TeamInviteUser_teamsId_fkey" FOREIGN KEY ("teamsId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInviteUser" ADD CONSTRAINT "TeamInviteUser_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamUser" ADD CONSTRAINT "TeamUser_teamsId_fkey" FOREIGN KEY ("teamsId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamUser" ADD CONSTRAINT "TeamUser_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventPermission" ADD CONSTRAINT "UserEventPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventPermission" ADD CONSTRAINT "UserEventPermission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

