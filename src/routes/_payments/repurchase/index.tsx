import { Button, Select, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import PackagesCard from "@/components/payments/components/packages/packages-card.tsx";
import { PaymentHeader } from "@/components/payments/components/ui/payment-header.tsx";
import classes from "@/components/payments/components/ui/payments.module.css";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGetPackages } from "@/server/IPS/deposits/get-packages.ts";

const Repurchase = () => {
	const { session } = useSession();
	const repurchaseCurrency = session?.user?.repurchaseCurrencies || [];

	const form = useForm({
		initialValues: {
			purchaseCurrency: repurchaseCurrency[0],
		},
	});
	const [isSubmitted, isSubmittedSet] = useState(false);

	const {
		data: allPackages,
		refetch,
		isFetching,
	} = useGetPackages({
		currency: `${form.values.purchaseCurrency}`,
	});
	return (
		<div className={classes.page}>
			<PaymentHeader title="Repurchase">
				Pick a currency to see the coin packages.
			</PaymentHeader>
			<form
				id="repurchase-package-form"
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
						data={repurchaseCurrency ?? []}
						placeholder="Select Currency"
						{...form.getInputProps("purchaseCurrency")}
					/>
				</div>
				<div className={classes.actions}>
					<Button
						form="repurchase-package-form"
						type="submit"
						loading={isFetching}
						disabled={!form.values.purchaseCurrency}
					>
						Show packages
					</Button>
				</div>
			</form>
			{allPackages?.data?.length ? (
				<PackagesCard packages={allPackages.data} />
			) : (
				isSubmitted && (
					<Text className={classes.lead}>
						No packages in {form?.values?.purchaseCurrency}. Try another
						currency.
					</Text>
				)
			)}
		</div>
	);
};

export const Route = createFileRoute("/_payments/repurchase/")({
	component: Repurchase,
	beforeLoad: ({ context: { authentication } }) => {
		if (!authentication?.session?.user?.loggedInBrand?.isSocialBrand) {
			throw redirect({
				to: "/",
			});
		}
	},
});
