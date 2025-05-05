-- CreateEnum
CREATE TYPE "events_state_enum" AS ENUM ('TEAM_FINDING', 'CODING_PHASE', 'SWISS_ROUND', 'ELIMINATION_ROUND', 'FINISHED');

-- CreateEnum
CREATE TYPE "events_type_enum" AS ENUM ('REGULAR', 'RUSH');

-- CreateEnum
CREATE TYPE "matches_phase_enum" AS ENUM ('SWISS', 'ELIMINATION');

-- CreateEnum
CREATE TYPE "matches_state_enum" AS ENUM ('PLANNED', 'READY', 'FINISHED');

-- CreateEnum
CREATE TYPE "user_event_permissions_role_enum" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL DEFAULT '',
    "location" VARCHAR NOT NULL DEFAULT '',
    "minTeamSize" INTEGER NOT NULL,
    "maxTeamSize" INTEGER NOT NULL,
    "startDate" TIMESTAMP(6) NOT NULL,
    "endDate" TIMESTAMP(6) NOT NULL,
    "state" "events_state_enum" NOT NULL DEFAULT 'TEAM_FINDING',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "events_type_enum" NOT NULL DEFAULT 'REGULAR',
    "repoTemplateOwner" VARCHAR,
    "repoTemplateName" VARCHAR,
    "treeFormat" INTEGER NOT NULL DEFAULT 16,
    "currentRound" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events_users" (
    "eventsId" UUID NOT NULL,
    "usersId" UUID NOT NULL,

    CONSTRAINT "PK_45fc40a9656b63fffcbe1256604" PRIMARY KEY ("eventsId","usersId")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "state" "matches_state_enum" NOT NULL,
    "round" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "winnerId" UUID,
    "phase" "matches_phase_enum" NOT NULL DEFAULT 'SWISS',

    CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches_teams" (
    "matchesId" UUID NOT NULL,
    "teamsId" UUID NOT NULL,

    CONSTRAINT "PK_36ace1702ab545be7ba5bab63e2" PRIMARY KEY ("matchesId","teamsId")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "repo" VARCHAR,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" UUID,
    "buchholzPoints" INTEGER,
    "hadBye" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams_invites_users" (
    "teamsId" UUID NOT NULL,
    "usersId" UUID NOT NULL,

    CONSTRAINT "PK_f3be81b71190b697f5b1359456e" PRIMARY KEY ("teamsId","usersId")
);

-- CreateTable
CREATE TABLE "teams_users" (
    "teamsId" UUID NOT NULL,
    "usersId" UUID NOT NULL,

    CONSTRAINT "PK_961ac69159467aaabfcd702c2ab" PRIMARY KEY ("teamsId","usersId")
);

-- CreateTable
CREATE TABLE "user_event_permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role" "user_event_permissions_role_enum" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,
    "eventId" UUID,

    CONSTRAINT "PK_70ceb6ae37a0e7a80034e63594d" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "githubId" VARCHAR NOT NULL,
    "githubAccessToken" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "username" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "profilePicture" VARCHAR,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canCreateEvent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_1be1fcf23efa4587e59aeea250" ON "events_users"("eventsId");

-- CreateIndex
CREATE INDEX "IDX_a8ec0c8bb2d204ad78348fea1e" ON "events_users"("usersId");

-- CreateIndex
CREATE UNIQUE INDEX "REL_eb5e9984be5b3bd5c8e3ef2d9e" ON "matches"("winnerId");

-- CreateIndex
CREATE INDEX "IDX_200c5a21dd735d2f334bbb0aba" ON "matches_teams"("teamsId");

-- CreateIndex
CREATE INDEX "IDX_5158327e24c6e29e9d2144d0b9" ON "matches_teams"("matchesId");

-- CreateIndex
CREATE INDEX "IDX_26b95583e861674f5a5631b3f5" ON "teams_invites_users"("teamsId");

-- CreateIndex
CREATE INDEX "IDX_9898d19dbe2b91604456d7a55f" ON "teams_invites_users"("usersId");

-- CreateIndex
CREATE INDEX "IDX_083b899d60a19c4fd682fc5db3" ON "teams_users"("teamsId");

-- CreateIndex
CREATE INDEX "IDX_0e26a42aaf7fa4086e423694e4" ON "teams_users"("usersId");

-- AddForeignKey
ALTER TABLE "events_users" ADD CONSTRAINT "FK_1be1fcf23efa4587e59aeea2508" FOREIGN KEY ("eventsId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_users" ADD CONSTRAINT "FK_a8ec0c8bb2d204ad78348fea1e1" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "FK_eb5e9984be5b3bd5c8e3ef2d9ec" FOREIGN KEY ("winnerId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches_teams" ADD CONSTRAINT "FK_200c5a21dd735d2f334bbb0aba3" FOREIGN KEY ("teamsId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches_teams" ADD CONSTRAINT "FK_5158327e24c6e29e9d2144d0b9b" FOREIGN KEY ("matchesId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "FK_f01dc07b27e3edecf109d539cd1" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams_invites_users" ADD CONSTRAINT "FK_26b95583e861674f5a5631b3f5d" FOREIGN KEY ("teamsId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_invites_users" ADD CONSTRAINT "FK_9898d19dbe2b91604456d7a55f2" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams_users" ADD CONSTRAINT "FK_083b899d60a19c4fd682fc5db37" FOREIGN KEY ("teamsId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_users" ADD CONSTRAINT "FK_0e26a42aaf7fa4086e423694e4c" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_event_permissions" ADD CONSTRAINT "FK_be10180bb75847f4c41e5057fed" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_event_permissions" ADD CONSTRAINT "FK_e189e82ce2e91fb825dba7a78a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

