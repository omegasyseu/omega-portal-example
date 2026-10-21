// The name the header avatar and the profile hub show, so both give the same initials:
// the player's full name, or their nickname when no name is set.
export const playerName = (
	player:
		| {
				firstName?: string | null;
				lastName?: string | null;
				nickname?: string | null;
		  }
		| undefined,
) =>
	[player?.firstName, player?.lastName].filter(Boolean).join(" ") ||
	(player?.nickname ?? "");
