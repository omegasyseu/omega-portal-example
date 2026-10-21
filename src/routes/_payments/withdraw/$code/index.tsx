import { Alert, Anchor, Button, Skeleton } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconInfoCircle } from "@tabler/icons-react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import PaymentInformationDropdown from "@/components/payments/components/payment-information/payment-information-dropdown";
import { AmountField } from "@/components/payments/components/ui/amount-field.tsx";
import { PaymentHeader } from "@/components/payments/components/ui/payment-header.tsx";
import classes from "@/components/payments/components/ui/payments.module.css";
import { shownPaymentMethod } from "@/components/payments/shown-payment-methods.ts";
import {
	getPaymentProviderNotes,
	getSupportedWithdrawalMethod,
} from "@/constants/payments";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { useGetWithdrawalOptions } from "@/server/IPS/withdraw/get-withdrawal-methods.ts";
import { useWithdraw } from "@/server/IPS/withdraw/process-withdraw.tsx";

const LOADING_HEIGHT = 120;

// Withdraw with one method: an amount (presets or any other), the saved payment details
// for methods that use them, then Withdraw. Once IPS's methods have loaded, a method IPS
// doesn't offer the player, or the Brand doesn't show for withdrawals, leads back to the
// list.
const WithdrawalPage = () => {
	const { mutate, isPending } = useWithdraw();
	const { selectedAccount } = useGeneralInfo();
	const form = useForm({
		initialValues: {
			amount: "",
			paymentInformationId: undefined,
		},
		validate: (values) => ({
			amount:
				values.amount === undefined
					? "Enter an amount"
					: Number(values.amount) < 0
						? "The amount can't be negative"
						: null,
		}),
	});
	const params = Route.useParams();
	const paymentProviderNotes = getPaymentProviderNotes(params.code);
	const withdrawalMethod = getSupportedWithdrawalMethod(params.code);
	const { data: withdrawalOptions, isPending: isMethodsPending } =
		useGetWithdrawalOptions();
	const { paymentMethods } = useBrandContent();
	const shown = shownPaymentMethod(
		params.code,
		withdrawalOptions?.offeredCodes ?? [],
		paymentMethods,
		"withdrawal",
	);
	if (isMethodsPending) {
		return (
			<div className={classes.page}>
				<Skeleton height={LOADING_HEIGHT} radius="lg" />
			</div>
		);
	}
	if (!shown) {
		return <Navigate to="/withdraw" replace />;
	}
	return (
		<div className={classes.page}>
			<PaymentHeader title={`Withdraw with ${shown.name}`}>
				<Anchor component={Link} to="/withdraw">
					Choose another method
				</Anchor>
			</PaymentHeader>
			<form
				id="withdraw"
				className={`${classes.panel} ${classes.narrow}`}
				onSubmit={form.onSubmit((v) => {
					mutate(
						{
							amount: `${v.amount}`,
							paymentMethod: params.code,
							paymentInformationId: v.paymentInformationId,
						},
						{
							onSuccess: () => {
								form.reset();
							},
						},
					);
				})}
			>
				{paymentProviderNotes ? (
					<Alert variant="light" title="Important" icon={<IconInfoCircle />}>
						{paymentProviderNotes}
					</Alert>
				) : null}
				<AmountField
					label="Amount"
					currency={selectedAccount?.currency}
					inputProps={form.getInputProps("amount")}
					onPreset={(amount) => form.setFieldValue("amount", amount)}
				/>
				{withdrawalMethod?.canSelectSavedPaymentInformation ? (
					<PaymentInformationDropdown
						type={withdrawalMethod.type}
						paymentMethods={[params.code]}
						{...form.getInputProps("paymentInformationId")}
					/>
				) : null}
				<div className={classes.actions}>
					<Button
						disabled={form.values.amount === "" || isPending}
						loading={isPending}
						type="submit"
						form="withdraw"
					>
						Withdraw
					</Button>
					<Button variant="default" component={Link} to="/withdraw">
						Back
					</Button>
				</div>
			</form>
		</div>
	);
};
export const Route = createFileRoute("/_payments/withdraw/$code/")({
	component: WithdrawalPage,
});
