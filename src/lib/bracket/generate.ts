export type MatchInput = {
  id: string;
  tournament_id: string;
  round: number;
  match_order: number;
  team1_id: string | null;
  team2_id: string | null;
  winner_id: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'LIVE';
  scheduled_at: string;
};

export type BracketInput = {
  id: string;
  tournament_id: string;
  match_id: string;
  next_match_id: string | null;
  is_left_child_of_next: boolean | null;
};

/**
 * Randomize an array
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Advance a winner to the next match in the tree
 */
function advanceWinner(winnerId: string, matchId: string, brackets: BracketInput[], matches: MatchInput[]) {
  const bracket = brackets.find(b => b.match_id === matchId);
  if (bracket && bracket.next_match_id) {
    const nextMatch = matches.find(m => m.id === bracket.next_match_id);
    if (nextMatch) {
      if (bracket.is_left_child_of_next) {
        nextMatch.team1_id = winnerId;
      } else {
        nextMatch.team2_id = winnerId;
      }
    }
  }
}

/**
 * Generate a Single Elimination bracket with mathematical byes
 */
export function generateSingleElimination(tournamentId: string, teamIds: string[], scheduledAt: string) {
  const n = teamIds.length;
  if (n < 2) throw new Error("At least 2 teams are required.");

  const capacity = Math.pow(2, Math.ceil(Math.log2(n)));
  const totalRounds = Math.log2(capacity);
  
  const matches: MatchInput[] = [];
  const brackets: BracketInput[] = [];
  const matchesByRound: MatchInput[][] = [];

  // Build tree bottom-up (Finals to Round 1)
  for (let r = totalRounds; r >= 1; r--) {
    const matchesInRound = Math.pow(2, totalRounds - r);
    const roundMatches: MatchInput[] = [];
    
    for (let m = 0; m < matchesInRound; m++) {
      const matchId = crypto.randomUUID();
      let nextMatchId = null;
      let isLeftChild = null;
      
      if (r < totalRounds) {
        // Parent match in the next round (r + 1)
        const nextRoundMatches = matchesByRound[totalRounds - (r + 1)];
        const parentMatchIndex = Math.floor(m / 2);
        nextMatchId = nextRoundMatches[parentMatchIndex].id;
        isLeftChild = m % 2 === 0;
      }
      
      const match: MatchInput = {
        id: matchId,
        tournament_id: tournamentId,
        round: r,
        match_order: m + 1,
        team1_id: null,
        team2_id: null,
        winner_id: null,
        status: 'SCHEDULED',
        scheduled_at: scheduledAt
      };
      
      const bracket: BracketInput = {
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        match_id: matchId,
        next_match_id: nextMatchId,
        is_left_child_of_next: isLeftChild
      };
      
      roundMatches.push(match);
      matches.push(match);
      brackets.push(bracket);
    }
    matchesByRound.push(roundMatches);
  }

  // Populate Round 1
  const shuffledTeams = shuffle(teamIds);
  // Pad with nulls to reach capacity
  const paddedTeams: (string | null)[] = [...shuffledTeams];
  while (paddedTeams.length < capacity) {
    paddedTeams.push(null);
  }

  // To distribute byes evenly, we could do standard seeding. For MVP we just use the padded array directly.
  const round1Matches = matchesByRound[totalRounds - 1]; // Round 1
  let teamIdx = 0;

  for (const m of round1Matches) {
    m.team1_id = paddedTeams[teamIdx++];
    m.team2_id = paddedTeams[teamIdx++];

    // If there's a Bye, auto-complete the match and advance the real team
    if (!m.team1_id || !m.team2_id) {
      if (m.team1_id || m.team2_id) {
        m.winner_id = m.team1_id || m.team2_id;
        m.status = 'COMPLETED';
        advanceWinner(m.winner_id as string, m.id, brackets, matches);
      }
    }
  }

  // Note: we can sort matches by round before returning so inserts are clean
  matches.sort((a, b) => a.round - b.round || a.match_order - b.match_order);

  return { matches, brackets };
}

/**
 * Generate a Round Robin schedule
 */
export function generateRoundRobin(tournamentId: string, teamIds: string[], scheduledAt: string) {
  const n = teamIds.length;
  if (n < 2) throw new Error("At least 2 teams are required.");

  const teams = shuffle(teamIds);
  // Add a dummy bye team if odd
  const hasBye = teams.length % 2 !== 0;
  if (hasBye) {
    teams.push("BYE");
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const halfSize = numTeams / 2;

  const matches: MatchInput[] = [];

  for (let r = 0; r < numRounds; r++) {
    for (let i = 0; i < halfSize; i++) {
      const team1 = teams[i];
      const team2 = teams[numTeams - 1 - i];

      // Skip the match if it involves the dummy "BYE" team
      if (team1 !== "BYE" && team2 !== "BYE") {
        matches.push({
          id: crypto.randomUUID(),
          tournament_id: tournamentId,
          round: r + 1,
          match_order: i + 1,
          team1_id: team1,
          team2_id: team2,
          winner_id: null,
          status: 'SCHEDULED',
          scheduled_at: scheduledAt
        });
      }
    }
    // Rotate the array for the next round, keeping the first team fixed (Circle method)
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }

  return { matches, brackets: [] };
}
