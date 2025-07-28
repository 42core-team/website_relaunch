# Frontend – Next.js & Prisma

This directory contains the frontend codebase, built with [Next.js](https://nextjs.org/) and [Prisma](https://www.prisma.io/).

---

# Migration to pnpm

This project has been migrated from npm to [pnpm](https://pnpm.io/).

## Getting Started

1. **Install pnpm** (if not already installed):

   ```sh
   corepack enable && corepack prepare pnpm@latest --activate
   # or
   brew install pnpm
   ```

2. **Install dependencies:**

   ```sh
   pnpm install
   ```

3. **Run the development server:**

   ```sh
   pnpm dev
   ```

4. **Build for production:**

   ```sh
   pnpm build
   ```

5. **Start the production server:**
   ```sh
   pnpm start
   ```

---

## Prisma Setup

### 1. Generate Prisma Client

After installing dependencies or updating your schema, generate the Prisma client:

```bash
npx prisma generate
```

### 2. Database Migrations

- **Apply existing migrations & create the database:**
  ```bash
  npx prisma migrate dev
  ```
- **Create a new migration after editing `prisma/schema.prisma`:**
  ```bash
  npx prisma migrate dev --name your-migration-name
  ```

### 3. Prisma Studio

To explore and edit your database in a GUI:

```bash
npx prisma studio
```

### 4. Keeping Prisma in Sync

- Whenever you change the Prisma schema (`prisma/schema.prisma`), always run `npx prisma generate` and create a new migration.
- If you pull new migrations from the repo, run `npx prisma migrate dev` to apply them locally.

---

## GitHub OAuth Setup

1. Go to **GitHub** → **Settings** → **Developer settings** → **OAuth Apps**
2. Register a new OAuth app.
3. Set the **Authorization callback URL** to:
   `http://localhost:3000/api/auth/callback`
4. Add your Client ID and Secret to your `.env` file.
5. **Create a GitHub secret for your repository or organization** that has access to invite people and create repositories. This secret will be used by the application for organization-level operations.
