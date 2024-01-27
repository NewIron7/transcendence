'use client'

import Leaderboard from "@/components/Leaderboard"
import MatchHistory from "@/components/MatchHistory"


export default function Home() {
  return (
    <main className="flex-auto flex items-center flex-wrap pl-10">
      <Leaderboard />
      <MatchHistory />
    </main>
  )
}
