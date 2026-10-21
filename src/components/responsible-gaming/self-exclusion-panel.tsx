import { Button, Radio, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import CodeEntryModal, {
	maskEmail,
} from "@/components/profile/code-entry-modal.tsx";
import SelfExclusionConfirmModal from "@/components/responsible-gaming/self-exclusion-confirm-modal.tsx";
import {
	isWrongCode,
	type SelfExclusionRequest,
	type SelfExclusionUnit,
	useSelfExclude,
} from "@/server/IPS/responsible-gaming/self-exclude.tsx";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";
import classes from "./rg-limits.module.css";

const WARNING_ICON_SIZE = 20;

type Duration = {
	value: string;
	label: string;
	lockPeriod: number;
	lockPeriodUnit: SelfExclusionUnit;
};

const DURATIONS: Duration[] = [
	{ value: "1-week", label: "1 week", lockPeriod: 1, lockPeriodUnit: "WEEK" },
	{
		value: "1-month",
		label: "1 month",
		lockPeriod: 1,
		lockPeriodUnit: "MONTH",
	},
	{
		value: "3-months",
		label: "3 months",
		lockPeriod: 3,
		lockPeriodUnit: "MONTH",
	},
	{
		value: "6-months",
		label: "6 months",
		lockPeriod: 6,
		lockPeriodUnit: "MONTH",
	},
];

const LOCK_DATE_FORMAT = "D MMMM YYYY";

// The backend works out the exact end time; this is the date the player is shown before confirming.
const lockedUntil = ({ lockPeriod, lockPeriodUnit }: Duration) =>
	dayjs()
		.add(lockPeriod, lockPeriodUnit === "WEEK" ? "week" : "month")
		.format(LOCK_DATE_FORMAT);

const DurationPicker = ({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) => (
	<Radio.Group
		value={value}
		onChange={onChange}
		label="Lock for"
		classNames={{ label: classes.choiceLabel }}
	>
		<div className={classes.choices}>
			{DURATIONS.map((duration) => (
				<Radio.Card
					key={duration.value}
					value={duration.value}
					className={classes.choice}
				>
					{duration.label}
				</Radio.Card>
			))}
		</div>
	</Radio.Group>
);

// Self-exclusion: a red-bordered card with the four durations; its button opens the
// confirmation, then the security-code step when the brand requires one, then the lock.
const SelfExclusionPanel = () => {
	const [selectedValue, setSelectedValue] = useState(DURATIONS[0].value);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	// The lock waiting for its security code; resent with the code to commit it.
	const [codeRequest, setCodeRequest] = useState<SelfExclusionRequest | null>(
		null,
	);
	// Separate instances so "Resend code" and "Confirm" show their own loading state.
	const lock = useSelfExclude();
	const confirm = useSelfExclude();
	const { data: playerInfo } = useGetPlayerInfo();
	const selected =
		DURATIONS.find((duration) => duration.value === selectedValue) ??
		DURATIONS[0];
	const until = lockedUntil(selected);

	const selfExclude = () => {
		const request = {
			lockPeriod: selected.lockPeriod,
			lockPeriodUnit: selected.lockPeriodUnit,
			lockedUntil: until,
		};
		lock.mutate(request, {
			onSuccess: (result) => {
				if (result === "CODE_REQUIRED") {
					setIsConfirmOpen(false);
					setCodeRequest(request);
				}
			},
			onError: () => setIsConfirmOpen(false),
		});
	};

	const confirmCode = (mfaCode: string) => {
		if (!codeRequest) {
			return;
		}
		confirm.mutate(
			{ ...codeRequest, mfaCode },
			{
				onSuccess: (result) => {
					if (result === "LOCKED") {
						setCodeRequest(null);
					}
				},
				// A wrong code keeps the step open for another try; any other failure ends it.
				onError: (error) => {
					if (!isWrongCode(error)) {
						setCodeRequest(null);
					}
				},
			},
		);
	};

	// Resending the same request without a code makes the backend issue a new one. If it
	// locks instead (the brand stopped asking for a code), the step is over.
	const resendCode = (onSent: () => void) => {
		if (codeRequest) {
			lock.mutate(codeRequest, {
				onSuccess: (result) =>
					result === "LOCKED" ? setCodeRequest(null) : onSent(),
			});
		}
	};

	return (
		<section className={classes.exclusion} aria-labelledby="self-exclusion">
			<div className={classes.exclusionHead}>
				<span className={classes.warningIcon}>
					<IconAlertTriangle size={WARNING_ICON_SIZE} aria-hidden />
				</span>
				<div>
					<Title order={3} id="self-exclusion" className={classes.cardTitle}>
						Self-exclusion
					</Title>
					<Text className={classes.exclusionText}>
						Lock your account for a set time. You&#39;ll be logged out straight
						away and can&#39;t sign in until it ends. Only our support team can
						lift it early. You can extend it later, but not shorten it.
					</Text>
				</div>
			</div>
			<div className={classes.exclusionActions}>
				<DurationPicker value={selectedValue} onChange={setSelectedValue} />
				<Button color="danger" onClick={() => setIsConfirmOpen(true)}>
					Self-exclude…
				</Button>
			</div>
			{codeRequest ? (
				<CodeEntryModal
					sentTo={maskEmail(playerInfo?.email)}
					changes={[
						{
							label: "Self-exclusion",
							from: "Not excluded",
							to: `Locked until ${codeRequest.lockedUntil}`,
						},
					]}
					close={() => setCodeRequest(null)}
					onConfirm={confirmCode}
					onResend={resendCode}
					confirming={confirm.isPending}
					resending={lock.isPending}
					confirmLabel="Lock my account"
				/>
			) : null}
			<SelfExclusionConfirmModal
				isOpen={isConfirmOpen}
				lockedUntil={until}
				isLocking={lock.isPending}
				onCancel={() => setIsConfirmOpen(false)}
				onConfirm={selfExclude}
			/>
		</section>
	);
};

export default SelfExclusionPanel;
