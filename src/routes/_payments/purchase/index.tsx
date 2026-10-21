import { Button, Loader, Select, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import PackagesCard from "@/components/payments/components/packages/packages-card.tsx";
import { MethodChoice } from "@/components/payments/components/ui/method-choice.tsx";
import { PaymentHeader } from "@/components/payments/components/ui/payment-header.tsx";
import classes from "@/components/payments/components/ui/payments.module.css";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGetDepositMethods } from "@/server/IPS/deposits/get-deposit-methods.ts";
import { useGetPackages } from "@/server/IPS/deposits/get-packages.ts";

const Purchases = () => {
	const { data: purchaseMethods, isLoading } = useGetDepositMethods();
	const { session } = useSession();
	const purchaseCurrencies = session?.user?.purchaseCurrencies || [];
	const form = useForm<{
		purchaseCurrency?: string;
		purchaseMethod?: string;
	}>({
		initialValues: {
			purchaseCurrency: purchaseCurrencies?.[0],
			purchaseMethod: undefined,
		},
	});
	const [isSubmitted, isSubmittedSet] = useState(false);

	const {
		data: allPackages,
		refetch,
		isFetching,
	} = useGetPackages({
		currency: `${form.values.purchaseCurrency}`,
		paymentMethod: form.values.purchaseMethod || undefined,
	});
	return (
		<div className={classes.page}>
			<PaymentHeader title="Purchase">
				Pick a currency and payment method to see the coin packages.
			</PaymentHeader>
			<form
				id="purchase-package-form"
				className={classes.panel}
				onSubmit={form.onSubmit(async () => {
					isSubmittedSet(true);
					await refetch();
				})}
			>
				<div className={classes.fields}>
					<Select
						label="Currency"
						name="purchaseCurrency"
						allowDeselect={false}
						searchable
						data={purchaseCurrencies ?? []}
						placeholder="Select Currency"
						{...form.getInputProps("purchaseCurrency")}
					/>
				</div>
				<fieldset className={classes.choice}>
					<legend className={classes.panelTitle}>Payment method</legend>
					{isLoading ? (
						<Loader size="sm" aria-label="Loading payment methods" />
					) : (
						<MethodChoice
							methods={purchaseMethods?.paymentMethodsValueAndLabel ?? []}
							selected={form.values.purchaseMethod}
							onSelect={(method) =>
								form.setFieldValue("purchaseMethod", method)
							}
						/>
					)}
				</fieldset>
				<div className={classes.actions}>
					<Button
						form="purchase-package-form"
						type="submit"
						loading={isFetching}
						disabled={
							!form.values.purchaseMethod || !form.values.purchaseCurrency
						}
					>
						Show packages
					</Button>
				</div>
			</form>
			{allPackages?.data?.length ? (
				<PackagesCard
					packages={allPackages.data}
					purchaseMethod={form?.values?.purchaseMethod}
				/>
			) : (
				isSubmitted && (
					<Text className={classes.lead}>
						No packages in {form?.values?.purchaseCurrency}. Try another
						currency or payment method.
					</Text>
				)
			)}
		</div>
	);
};

export const Route = createFileRoute("/_payments/purchase/")({
	component: Purchases,
	beforeLoad: ({ context: { authentication } }) => {
		if (!authentication?.session?.user?.loggedInBrand?.isSocialBrand) {
			throw redirect({
				to: "/",
			});
		}
	},
});
