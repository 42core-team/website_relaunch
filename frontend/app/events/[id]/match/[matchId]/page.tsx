export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const matchId = (await params).matchId;
  return <div>Match {matchId}</div>;
}
