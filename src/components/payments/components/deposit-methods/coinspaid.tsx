import { Button, ScrollArea, Select, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import classes from "@/components/payments/components/ui/payments.module.css";
import {
	useGetBtcWallet,
	useGetCreatedCryptoAccounts,
	useGetCurrencyList,
} from "@/server/IPS/deposits/get-currency-list.ts";

type Props = {
	code: string;
};

const ADDRESS_LIST_HEIGHT = 300;

// Coinspaid: create a crypto deposit address for a currency, or look up the ones made.
const Coinspaid = ({ code }: Props) => {
	const [value, setValue] = useState<string | null>("");
	const [createdAccountCurrency, setCreatedAccountCurrency] = useState<
		string | null
	>("");

	const { data } = useGetCurrencyList({
		paymentMethod: code,
	});
	const { data: createdAddresses, refetch: refetchCreadtedAddresses } =
		useGetCreatedCryptoAccounts({
			currency: createdAccountCurrency as string,
			paymentMethod: code,
		});
	const { data: currencyWalletCreated, refetch } = useGetBtcWallet({
		currency: value as string,
		paymentMethod: code,
	});

	return (
		<div className={classes.split}>
			<section className={classes.panel} aria-labelledby="new-address">
				<Title order={2} id="new-address" className={classes.panelTitle}>
					New address
				</Title>
				<Select
					allowDeselect={false}
					name="coinspaidcurrency"
					data={data?.currencyLabelAndValueCrypto}
					label="Currency"
					value={value}
					onChange={setValue}
				/>
				<div className={classes.actions}>
					<Button
						disabled={value === ""}
						type="submit"
						onClick={async () => {
							await refetch();
							await refetchCreadtedAddresses();
						}}
					>
						Create Address
					</Button>
					<Button variant="default" component={Link} to="/deposit">
						Back
					</Button>
				</div>
				{currencyWalletCreated?.address ? (
					<div className={classes.address}>
						<Text className={classes.lead}>
							New address for {currencyWalletCreated.address.paymentMethod}
						</Text>
						<Text className={classes.addressValue}>
							{currencyWalletCreated.address.address}
						</Text>
						<Text className={classes.note}>
							Currency: {currencyWalletCreated.address.currency} · Status:{" "}
							{currencyWalletCreated.address.status}
						</Text>
					</div>
				) : null}
			</section>
			<section className={classes.panel} aria-labelledby="created-addresses">
				<Title order={2} id="created-addresses" className={classes.panelTitle}>
					Created addresses
				</Title>
				<Select
					allowDeselect={false}
					data={data?.currencyLabelAndValueCrypto}
					label="Currency"
					value={createdAccountCurrency}
					onChange={setCreatedAccountCurrency}
				/>
				<ScrollArea h={ADDRESS_LIST_HEIGHT}>
					<Stack gap="xs">
						{createdAddresses?.addresses?.length ? (
							createdAddresses.addresses.map((address) => (
								<div key={address?.address} className={classes.address}>
									<Text className={classes.addressValue}>
										{address?.address}
									</Text>
									<Text className={classes.note}>
										Currency: {address?.currency}
									</Text>
								</div>
							))
						) : (
							<Text className={classes.lead}>
								No addresses yet for this currency.
							</Text>
						)}
					</Stack>
				</ScrollArea>
			</section>
		</div>
	);
};

export default Coinspaid;
