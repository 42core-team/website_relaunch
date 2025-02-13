import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

const pbAdmin = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
pbAdmin.authStore.save(process.env.POCKETBASE_ADMIN_KEY || "", null);

export { pb, pbAdmin };

export default pb