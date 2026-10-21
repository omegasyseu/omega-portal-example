import { Button } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import { AmountField } from "@/components/payments/components/ui/amount-field.tsx";
import {
	amountToCheck,
	pickedPlanId,
} from "@/components/payments/components/ui/bonus-choice.ts";
import {
	type BonusCheck,
	BonusPlanPicker,
} from "@/components/payments/components/ui/bonus-plan-picker.tsx";
import {
	DepositConfirmation,
	type DepositReceipt,
} from "@/components/payments/components/ui/deposit-confirmation.tsx";
import classes from "@/components/payments/components/ui/payments.module.css";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { useGetDepositEligibleBonusPlan } from "@/server/IPS/deposits/get-deposit-eligible-bonus-plans.ts";

export type DepositAmountValues = { amount: string; selectedBonus: string };
// What the method deposits: the values, and the picked plan's name for the receipt.
export type DepositSubmission = DepositAmountValues & { bonusName?: string };

// How long the amount rests before its bonus plans are checked, so typing "100"
// doesn't check 1 and 10 on the way.
const BONUS_CHECK_DELAY_MS = 400;

type Props = {
	code: string;
	form: UseFormReturnType<DepositAmountValues>;
	dailyLimit?: number | string;
	// What the button says (Deposit, Open Payment) and does with the valid values.
	submitLabel: string;
	isSubmitting?: boolean;
	onSubmit: (submission: DepositSubmission) => void;
	// Set once the deposit has gone through: the confirmation then takes the form's place.
	receipt?: DepositReceipt;
	onAnotherDeposit: () => void;
};

// The deposit OMEGA Bank, Pay.com and PaymentIQ share, as one panel: the amount, the
// bonus to claim with it (none, or a plan checked for that amount as it's entered),
// then the method's own action. A finished deposit shows its confirmation instead.
export function DepositAmountStep({
	code,
	form,
	dailyLimit,
	submitLabel,
	isSubmitting,
	onSubmit,
	receipt,
	onAnotherDeposit,
}: Props) {
	const { selectedAccount } = useGeneralInfo();
	const { amount } = form.values;
	const checkableAmount = amountToCheck(amount, dailyLimit);
	const [settledAmount] = useDebouncedValue(
		checkableAmount,
		BONUS_CHECK_DELAY_MS,
	);
	const bonusPlans = useGetDepositEligibleBonusPlan({
		paymentMethod: code,
		depositAmount: settledAmount,
	});
	const check: BonusCheck =
		amount === ""
			? "no-amount"
			: checkableAmount === undefined
				? "invalid-amount"
				: // Still waiting for the amount to rest, or for its plans.
					checkableAmount !== settledAmount || bonusPlans.isFetching
					? "checking"
					: bonusPlans.isError
						? "failed"
						: "ready";
	const plans = check === "ready" ? bonusPlans.data?.bonusPlans : undefined;
	// A new amount keeps the picked plan only if it's eligible for that one too.
	const pickedBonus = pickedPlanId(form.values.selectedBonus, plans);

	if (receipt) {
		return (
			<DepositConfirmation
				receipt={receipt}
				onAnotherDeposit={() => {
					form.reset();
					onAnotherDeposit();
				}}
			/>
		);
	}

	return (
		<form
			className={`${classes.panel} ${classes.checkout}`}
			onSubmit={form.onSubmit((values) =>
				onSubmit({
					...values,
					selectedBonus: pickedBonus,
					bonusName: plans?.find(
						({ bonusPlanId }) => bonusPlanId === pickedBonus,
					)?.bonusPlanName,
				}),
			)}
		>
			<AmountField
				label="Deposit amount"
				currency={selectedAccount?.currency}
				dailyLimit={dailyLimit ?? 0}
				inputProps={{ name: "amount", ...form.getInputProps("amount") }}
				onPreset={(preset) => form.setFieldValue("amount", preset)}
			/>
			<BonusPlanPicker
				plans={plans}
				selectedId={pickedBonus}
				onSelect={(id) => form.setFieldValue("selectedBonus", id)}
				check={check}
				onRetry={() => void bonusPlans.refetch()}
			/>
			<div className={classes.actions}>
				<Button
					type="submit"
					size="md"
					loading={isSubmitting}
					// Waits for the amount's bonuses, so none is claimed by accident before
					// they show.
					disabled={!(Number(amount) > 0) || check === "checking"}
				>
					{submitLabel}
				</Button>
				<Button
					variant="default"
					size="md"
					component={Link}
					to="/deposit"
					onClick={() => form.reset()}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
