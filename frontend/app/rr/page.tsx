export default async function RickRollPage() {
    const shouldRedirectToVideo = Math.random() < 0.5;
    const redirectUrl = shouldRedirectToVideo
        ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        : "/";

    return (
        <div className="flex items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Redirecting...</h1>
        <script>
            {`window.location.href = "${redirectUrl}";`}
        </script>
        </div>
    );
}