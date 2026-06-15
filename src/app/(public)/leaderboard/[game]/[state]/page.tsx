import LeaderboardPage from "../../page"

interface SEOLeaderboardPageProps {
  params: Promise<{
    game: string
    state: string
  }>
}

export default async function SEOLeaderboardPage({ params }: SEOLeaderboardPageProps) {
  const { game, state } = await params

  // Convert kebab-case state (e.g., "madhya-pradesh") to Title Case ("Madhya Pradesh")
  // and handle special words like "and" in Union Territories
  const formattedState = state
    .split("-")
    .map((word) => {
      if (word.toLowerCase() === "and") return "and"
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")

  // Build simulated search params for the base Leaderboard Page component
  const simulatedSearchParams = Promise.resolve({
    game: game,
    state: formattedState,
    scope: "NATIONAL",
  })

  return <LeaderboardPage searchParams={simulatedSearchParams} />
}
export const runtime = 'edge';
