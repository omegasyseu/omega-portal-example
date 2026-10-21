import { Switch } from "@mantine/core";
import { IconEyeOff } from "@tabler/icons-react";
import { ProfileCard } from "@/components/profile/general-info/profile-card.tsx";
import { useChangePrivateModeStatus } from "@/server/IPS/general/enable-disable-private-mode.tsx";
import { useGetPrivateModeStatus } from "@/server/IPS/general/get-private-mode-status.ts";
import classes from "./general-info.module.css";

// Private Mode: the player's name is masked wherever other players see it, on
// leaderboards and in the live winner feeds.
export function PrivacyCard() {
	const { data, isError } = useGetPrivateModeStatus();
	const privateModeMutation = useChangePrivateModeStatus();
	const isPrivate = Boolean(data?.privateMode);

	return (
		<ProfileCard
			id="privacy"
			icon={IconEyeOff}
			title="Privacy"
			className={classes.privacy}
		>
			<Switch
				label="Private Mode"
				description="Hides your name on leaderboards and in the live winner feeds."
				checked={isPrivate}
				// Off until the status is known (a failed load still lets the player try).
				disabled={
					(data === undefined && !isError) || privateModeMutation.isPending
				}
				onChange={() =>
					privateModeMutation.mutate({ action: isPrivate ? "optOut" : "optIn" })
				}
			/>
		</ProfileCard>
	);
}
