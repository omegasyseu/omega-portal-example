import { Badge, Button, Group, Progress, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChallengeTimeLeft } from "@/components/challenges/challenge-time-left.tsx";
import {
	type Challenge,
	isComplete,
} from "@/components/challenges/use-challenges.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { fetchChallengeOptions } from "@/server/IPS/challenges/get-challenges.ts";
import { useRedeemChallenge } from "@/server/IPS/challenges/redeem-challange.tsx";
import classes from "./challenges.module.css";

const CHECK_ICON_SIZE = 14;

// A claimable challenge counts as fully done, whatever progress the API reports.
const progressShown = (challenge: Challenge) =>
	challenge.status === "CLAIMABLE" ? challenge.target : challenge.progress;

const ClaimButton = ({ challenge }: { challenge: Challenge }) => {
	const queryClient = useQueryClient();
	const { session } = useSession();
	const redeem = useRedeemChallenge();
	return (
		<Button
			fullWidth
			aria-label={`Claim: ${challenge.title}`}
			loading={redeem.isPending}
			onClick={() =>
				redeem.mutate(
					{ challengeUUID: challenge.challengeUUID },
					{
						onSuccess: () =>
							queryClient.invalidateQueries({
								queryKey: fetchChallengeOptions({ session }).queryKey,
							}),
					},
				)
			}
		>
			Claim
		</Button>
	);
};

// One challenge in the Omega Wins Daily Challenge style: its reward, what to do, a
// progress bar, then the time left, or Completed and Claim once it's done.
export function ChallengeRow({ challenge }: { challenge: Challenge }) {
	const isDone = isComplete(challenge);

	return (
		<article className={classes.row}>
			<Group justify="space-between" wrap="nowrap" gap="sm">
				<span className={classes.reward}>
					{isDone ? <IconCheck size={CHECK_ICON_SIZE} aria-hidden /> : null}
					{challenge.awardAmount} {challenge.currency}
				</span>
				<Text className={classes.task}>{challenge.title}</Text>
			</Group>
			<Progress
				value={challenge.percentage}
				color={isDone ? "neon" : undefined}
				aria-label={`${challenge.title} progress`}
			/>
			<Group justify="space-between" className={classes.numbers}>
				<span>{progressShown(challenge)}</span>
				{isDone ? (
					<Badge variant="light" color="neon" tt="none">
						Completed
					</Badge>
				) : (
					<span>{challenge.target}</span>
				)}
			</Group>
			{isDone ? (
				<ClaimButton challenge={challenge} />
			) : (
				<ChallengeTimeLeft endDate={challenge.endDate} />
			)}
		</article>
	);
}
