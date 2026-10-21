import { Button, Loader, Title } from "@mantine/core";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import {
	getPaymentOrigin,
	returnLink,
} from "@/components/payments/payment-origin.ts";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { useGetUserBalance } from "@/server/IPS/user/get-user-balance.ts";
import classes from "./payments.module.css";

const ICON_SIZE = 40;

// What a finished deposit shows: its amount and the bonus claimed with it, if any.
export type DepositReceipt = { amount: string; bonusName?: string };

type Props = {
	receipt: DepositReceipt;
	onAnotherDeposit: () => void;
};

// The player's balance in the account they deposited to. The deposit refreshed it
// before the confirmation showed, so a later background refresh keeps it in view.
const NewBalance = ({ currency }: { currency: string }) => {
	const { data, isPending } = useGetUserBalance();
	const balance = data?.currencyBalances?.find(
		(account) => account.currency === currency,
	);
	if (balance) {
		return <>{formatNumByCurrency(balance.totalBalanceNumber, currency)}</>;
	}
	return isPending ? (
		<Loader size="xs" aria-label="Loading your balance" />
	) : (
		<>Not available right now</>
	);
};

// Takes the deposit form's place once the deposit has gone through: what was
// deposited, the new balance and the bonus claimed, then the way back to playing or
// another deposit.
export function DepositConfirmation({ receipt, onAnotherDeposit }: Props) {
	const { selectedAccount } = useGeneralInfo();
	const currency = selectedAccount?.currency ?? "";
	// Where the player came from, read once: the way back doesn't change under them.
	const [back] = useState(() => returnLink(getPaymentOrigin()));
	const headingRef = useRef<HTMLHeadingElement>(null);
	const headingId = useId();

	// The form the player was using is gone, so focus moves to the news.
	useEffect(() => {
		headingRef.current?.focus();
	}, []);

	return (
		<section
			className={`${classes.panel} ${classes.checkout} ${classes.receipt}`}
			aria-labelledby={headingId}
		>
			<IconCircleCheckFilled
				size={ICON_SIZE}
				className={classes.receiptIcon}
				aria-hidden
			/>
			<Title
				order={2}
				id={headingId}
				ref={headingRef}
				tabIndex={-1}
				className={classes.receiptTitle}
			>
				{formatNumByCurrency(Number(receipt.amount), currency)} deposited
			</Title>
			<dl className={classes.exchange}>
				<dt>New balance</dt>
				<dd>
					<NewBalance currency={currency} />
				</dd>
				<dt>Bonus</dt>
				<dd>{receipt.bonusName ?? "None"}</dd>
			</dl>
			<div className={classes.actions}>
				<Button component={Link} href={back.href} size="md">
					{back.label}
				</Button>
				<Button variant="default" size="md" onClick={onAnotherDeposit}>
					Make another deposit
				</Button>
			</div>
		</section>
	);
}
