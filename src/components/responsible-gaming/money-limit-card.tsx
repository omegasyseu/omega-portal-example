import { Button, NumberInput, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
	findLimitSlot,
	formatAmount,
	LIMIT_TYPE_LABELS,
	type MoneyLimitValues,
	moneyLimitChanges,
	pendingLimitNote,
	type UnsavedLimitFields,
	unsavedLimitFields,
} from "@/components/responsible-gaming/limit-rows.ts";
import { PendingLimitNote } from "@/components/responsible-gaming/pending-limit-note.tsx";
import type { LimitQueue } from "@/components/responsible-gaming/use-limit-queue.ts";
import { getCurrencyFromMap } from "@/hooks/use-format/fomatCurrencySymbol";
import {
	MONEY_LIMIT_PERIODS,
	type MoneyLimitType,
	type ResponsibleGamingLimit,
} from "@/schemas-types/responsible-gaming";
import { isRejectedAmount } from "@/server/IPS/responsible-gaming/update-responsible-gaming-limit.tsx";
import classes from "./rg-limits.module.css";

const INVALID_AMOUNT = "Enter an amount greater than 0";

const HINTS: Record<MoneyLimitType, string> = {
	DEPOSIT_LIMIT: "The most you can deposit in each period.",
	WAGER_LIMIT: "The most you can bet in each period.",
	LOSS_LIMIT: "The most you can lose in each period.",
};

type Props = {
	limitType: MoneyLimitType;
	limits: ResponsibleGamingLimit[];
	currency?: string;
	queue: LimitQueue;
	// Amounts and the error kept from a Save that stopped on an error.
	unsaved: UnsavedLimitFields | null;
	onUnsavedChange: (unsaved: UnsavedLimitFields | null) => void;
};

// "€40 used · €60 left" under a period that has a limit.
const usage = (
	active: ResponsibleGamingLimit | undefined,
	currency?: string,
) =>
	active?.limit
		? `${formatAmount(active.cumulatedValue ?? 0, currency)} used · ${formatAmount(active.remainingAllowance ?? active.limit, currency)} left`
		: "No limit";

// One RG Limit type: Daily, Weekly and Monthly fields with one Save, and a Pending Limit
// note for each raise or removal waiting for its Cool-down.
export function MoneyLimitCard({
	limitType,
	limits,
	currency,
	queue,
	unsaved,
	onUnsavedChange,
}: Props) {
	const slots = MONEY_LIMIT_PERIODS.map((periodType) => ({
		periodType,
		...findLimitSlot(limits, limitType, periodType),
	}));
	const form = useForm<MoneyLimitValues>({
		initialValues: {
			...(Object.fromEntries(
				slots.map(({ periodType, active }) => [
					periodType,
					active?.limit ?? "",
				]),
			) as MoneyLimitValues),
			...unsaved?.values,
		},
		initialErrors: unsaved?.errors,
		// Once the player edits, the form holds what they typed; a later remount mustn't
		// bring back the older amounts.
		onValuesChange: () => onUnsavedChange(null),
		validate: (values) =>
			Object.fromEntries(
				MONEY_LIMIT_PERIODS.map((period) => [
					period,
					values[period] === "" ||
					(typeof values[period] === "number" && values[period] > 0)
						? null
						: INVALID_AMOUNT,
				]),
			),
	});
	const changes = moneyLimitChanges(limitType, limits, form.values);
	const label = LIMIT_TYPE_LABELS[limitType];
	const titleId = `rg-${limitType}`;

	const submit = form.onSubmit(() => {
		onUnsavedChange(null);
		queue.saveAll(changes, {
			onError: (error, change, notSaved) => {
				// Other errors are shown as a toast by the mutation hook
				const rejection = isRejectedAmount(error, change)
					? (error.backendMessage ?? INVALID_AMOUNT)
					: null;
				if (rejection) {
					form.setFieldError(change.periodType, rejection);
				}
				// Changes that saved reset this card; it starts again from these.
				onUnsavedChange(unsavedLimitFields(limitType, notSaved, rejection));
			},
		});
	});

	return (
		<form className={classes.card} aria-labelledby={titleId} onSubmit={submit}>
			<div className={classes.cardHead}>
				<div>
					<Title order={3} id={titleId} className={classes.cardTitle}>
						{label}
					</Title>
					<Text className={classes.hint}>{HINTS[limitType]}</Text>
				</div>
				<Button
					type="submit"
					variant="default"
					loading={queue.isSaving(limitType)}
					disabled={
						changes.length === 0 || (queue.isBusy && !queue.isSaving(limitType))
					}
				>
					Save
				</Button>
			</div>
			<div className={classes.periods}>
				{slots.map(({ periodType, active }) => (
					<div key={periodType} className={classes.period}>
						<NumberInput
							label={periodType}
							placeholder="No limit"
							leftSection={getCurrencyFromMap(currency)}
							classNames={{ section: classes.currency }}
							min={0}
							decimalScale={2}
							thousandSeparator=","
							hideControls
							autoComplete="off"
							{...form.getInputProps(periodType)}
						/>
						<Text className={classes.usage}>{usage(active, currency)}</Text>
					</div>
				))}
			</div>
			{slots.some(({ pending }) => pending) ? (
				<div className={classes.notices}>
					{slots.map(({ periodType, active, pending }) =>
						pending ? (
							<PendingLimitNote
								key={periodType}
								note={pendingLimitNote({
									periodType,
									pending,
									active,
									currency,
								})}
							/>
						) : null,
					)}
				</div>
			) : null}
		</form>
	);
}
