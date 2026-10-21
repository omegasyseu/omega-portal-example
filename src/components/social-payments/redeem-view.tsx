import { Button, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { AmountField } from "@/components/payments/components/ui/amount-field.tsx";
import { MethodChoice } from "@/components/payments/components/ui/method-choice.tsx";
import { PaymentHeader } from "@/components/payments/components/ui/payment-header.tsx";
import classes from "@/components/payments/components/ui/payments.module.css";
import {
	useGetPrepareWithdrawal,
	useRedeemWithdrawal,
} from "@/components/social-payments/queries/prepare-withdrawal.tsx";
import { useGetWithdrawalOptions } from "@/server/IPS/withdraw/get-withdrawal-methods.ts";

// Redeem on social brands: pick a method, see its exchange rate, then an amount.
const RedeemView = () => {
	const form = useForm({
		initialValues: {
			redeemMethod: "",
			amount: "",
		},
	});
	const { data } = useGetWithdrawalOptions();
	const { data: redeemData } = useGetPrepareWithdrawal({
		paymentMethod: form.getValues().redeemMethod,
	});

	const { mutate, isPending } = useRedeemWithdrawal();
	const methods = data?.supportedMethods ?? [];

	return (
		<div className={classes.page}>
			<PaymentHeader title="Redeem">
				Choose where you'd like to redeem to.
			</PaymentHeader>
			<div className={classes.split}>
				<section className={classes.panel} aria-labelledby="redeem-method">
					<Title order={2} id="redeem-method" className={classes.panelTitle}>
						Payment method
					</Title>
					{methods.length > 0 ? (
						<MethodChoice
							methods={methods.map((method) => ({
								value: method.code,
								label: method.paymentMethod,
							}))}
							selected={form.getValues().redeemMethod}
							onSelect={(method) => form.setFieldValue("redeemMethod", method)}
						/>
					) : (
						<Text className={classes.lead}>
							There's no way to redeem right now. Contact Customer Support for
							help.
						</Text>
					)}
				</section>
				{form.getValues().redeemMethod ? (
					<section className={classes.panel} aria-labelledby="redeem-amount">
						<Title order={2} id="redeem-amount" className={classes.panelTitle}>
							Amount
						</Title>
						<dl className={classes.exchange}>
							<dt>Convert from</dt>
							<dd>{redeemData?.convertFromCurrency}</dd>
							<dt>Convert to</dt>
							<dd>{redeemData?.convertToCurrency}</dd>
							<dt>Conversion rate</dt>
							<dd>{redeemData?.conversionRate}</dd>
						</dl>
						<AmountField
							label="Redeem amount"
							currency={redeemData?.convertFromCurrency}
							inputProps={form.getInputProps("amount")}
							onPreset={(amount) => form.setFieldValue("amount", amount)}
						/>
						<Button
							loading={isPending}
							disabled={
								!form.getValues().redeemMethod || !form.getValues().amount
							}
							onClick={() => {
								mutate(
									{
										paymentMethod: form.getValues().redeemMethod,
										amount: form.getValues().amount,
										conversionId: redeemData?.conversionId,
									},
									{
										onSuccess() {
											form.reset();
										},
									},
								);
							}}
						>
							Redeem Now
						</Button>
					</section>
				) : null}
			</div>
		</div>
	);
};

export default RedeemView;
