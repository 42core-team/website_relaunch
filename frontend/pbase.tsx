import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

pb.authStore.onChange((token, model) => {
    document.cookie = pb.authStore.exportToCookie({httpOnly: false});
});


export default pb