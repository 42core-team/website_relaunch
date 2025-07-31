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

3. **Set up environment variables:**

   Create a `.env.local` file in the frontend directory with the following variables:

   ```env
   # 42 School OAuth Configuration
   NEXT_PUBLIC_FORTY_TWO_CLIENT_ID=your_42_client_id_here
   FORTY_TWO_CLIENT_SECRET=your_42_client_secret_here

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # Database (if using local database)
   # DATABASE_URL=your_database_url_here
   ```

4. **Run the development server:**

   ```sh
   pnpm dev
   ```

5. **Build for production:**

   ```sh
   pnpm build
   ```

6. **Start the production server:**
   ```sh
   pnpm start
   ```

---

## Docker Configuration

This project uses **normal Next.js mode** (not standalone) to ensure environment variables are properly available at runtime. The Dockerfile is configured to:

- Build the Next.js application normally
- Install production dependencies in the final image
- Use `pnpm start` to run the application

This approach ensures that `NEXT_PUBLIC_*` environment variables are properly available to the client-side code.

---

## Environment Variables

### Required for OAuth

- `NEXT_PUBLIC_FORTY_TWO_CLIENT_ID`: Your 42 School OAuth application client ID
- `FORTY_TWO_CLIENT_SECRET`: Your 42 School OAuth application client secret
- `NEXTAUTH_URL`: The base URL of your application (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET`: A random string used to encrypt JWT tokens

### OAuth Setup

#### 42 School OAuth

1. Go to **42 School** → **Settings** → **API** → **Applications**
2. Create a new application
3. Set the **Redirect URI** to: `http://localhost:3000/auth/callback/42`
4. Copy the **Client ID** and **Client Secret** and add them to your `.env.local` file

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
