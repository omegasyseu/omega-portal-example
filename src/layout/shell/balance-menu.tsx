import {
	ActionIcon,
	Button,
	Menu,
	NumberFormatter,
	Text,
	UnstyledButton,
	VisuallyHidden,
} from "@mantine/core";
import { IconChevronDown, IconWallet } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { HEADER_CONTROL_SIZE, MENU_ICON_SIZE } from "@/constants/ui-sizes.ts";
import { useFormat } from "@/hooks/use-format";
import { getCurrencySymbol } from "@/hooks/use-format/fomatCurrencySymbol";
import { useShellNavigation } from "@/layout/shell/use-shell-navigation.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import type { currencyBalancesType } from "@/schemas-types/profile/user-balance.ts";
import { useGetUserBalance } from "@/server/IPS/user/get-user-balance.ts";
import { useGetCashback } from "@/server/IPS/user/get-user-cashback-balance.ts";
import { useRedeemCashback } from "@/server/IPS/user/redeem-cashback.tsx";
import classes from "./shell.module.css";

// Wide enough for the cash and bonus amounts and the cashback claim beneath them.
const MENU_WIDTH = 220;
const WALLET_ICON_SIZE = 16;

type CurrencyBalance = currencyBalancesType[number];

const Amount = ({ value }: { value?: string | number }) => (
	<NumberFormatter
		value={value}
		thousandSeparator
		decimalScale={2}
		fixedDecimalScale
	/>
);

// Each account the player holds, as on Omega Wins: its currency on a coin and its total.
// Picking one makes it the account the header and the games use.
const Accounts = ({ balances }: { balances: CurrencyBalance[] }) => {
	const { session } = useSession();
	const { selectedAccount, setSelectedAccount } = useGeneralInfo();

	const switchCurrency = (currency: string) => {
		const account = session?.user?.associatedAccounts?.find(
			(associated) => associated.currency === currency,
		);
		if (account) {
			setSelectedAccount("portal-5-selected-account", account);
		}
	};

	return balances.map((balance) => {
		const isSelected = balance.currency === selectedAccount?.currency;
		return (
			<Menu.Item
				key={balance.currency}
				data-selected={isSelected || undefined}
				className={classes.account}
				onClick={() => switchCurrency(balance.currency)}
				leftSection={
					<span className={classes.coin} aria-hidden>
						{balance.currency}
					</span>
				}
			>
				<VisuallyHidden>{balance.currency} </VisuallyHidden>
				<Amount value={balance.totalBalance} />
				{isSelected ? <VisuallyHidden>, selected</VisuallyHidden> : null}
			</Menu.Item>
		);
	});
};

// What the selected account's total is made of.
const BalanceRows = ({ balance }: { balance?: CurrencyBalance }) => {
	const currencySymbol = getCurrencySymbol(balance?.currency);
	const rows = [
		{ label: "Cash", amount: balance?.totalWithdrawableBalance },
		{ label: "Bonus", amount: balance?.bonusBalance },
	];

	return (
		<dl className={classes.breakdown}>
			{rows.map((row) => (
				<div key={row.label} className={classes.breakdownRow}>
					<dt>{row.label}</dt>
					<dd>
						{currencySymbol} <Amount value={row.amount} />
					</dd>
				</div>
			))}
		</dl>
	);
};

const CashbackClaim = () => {
	const { data: cashback } = useGetCashback();
	const { mutate: redeemCashback, isPending } = useRedeemCashback();
	const { formatCurrencyFromMap } = useFormat();

	if ((cashback?.cashbackPlayerAvailable ?? 0) <= 0) {
		return null;
	}

	return (
		<>
			<Menu.Divider />
			<div className={classes.cashback}>
				<Text className={classes.cashbackLabel}>
					Cashback{" "}
					<span className={classes.cashbackAmount}>
						{formatCurrencyFromMap(cashback?.currency)}{" "}
						<Amount value={cashback?.cashbackPlayerAvailable} />
					</span>
				</Text>
				<Button
					size="compact-sm"
					fullWidth
					loading={isPending}
					onClick={() => redeemCashback()}
				>
					Claim cashback
				</Button>
			</div>
		</>
	);
};

// The wallet button inside the balance: Deposit, or Buy Coins on a social brand.
const WalletButton = () => {
	const { callToAction } = useShellNavigation();
	return (
		<ActionIcon
			component={Link}
			to={callToAction.to}
			color="cta"
			aria-label={callToAction.label}
			className={classes.walletButton}
		>
			<IconWallet size={WALLET_ICON_SIZE} aria-hidden />
		</ActionIcon>
	);
};

// The header wallet, as on Omega Wins: the selected account's balance, opening the
// accounts (with what the balance is made of and any cashback to claim), and the wallet
// button to Deposit, or Buy Coins on a social brand.
export const BalanceMenu = () => {
	const { data: userBalance } = useGetUserBalance();
	const { selectedAccount } = useGeneralInfo();

	const currencyBalances = userBalance?.currencyBalances ?? [];
	const selectedBalance = currencyBalances.find(
		(balance) => balance.currency === selectedAccount?.currency,
	);

	return (
		<div className={classes.wallet}>
			<Menu
				closeOnItemClick={false}
				width={MENU_WIDTH}
				position="bottom-end"
				classNames={{ dropdown: classes.walletMenu }}
			>
				<Menu.Target>
					<UnstyledButton
						h={HEADER_CONTROL_SIZE}
						className={classes.balanceButton}
					>
						{/* Read as "Balance €117,021.13", the amount the button shows. */}
						<VisuallyHidden>Balance </VisuallyHidden>
						<span className={classes.balanceSymbol}>
							{getCurrencySymbol(selectedBalance?.currency)}
						</span>
						<span className={classes.balanceAmount}>
							<Amount value={selectedBalance?.totalBalance} />
						</span>
						<IconChevronDown
							size={MENU_ICON_SIZE}
							className={classes.balanceChevron}
							aria-hidden
						/>
					</UnstyledButton>
				</Menu.Target>
				<Menu.Dropdown>
					<Accounts balances={currencyBalances} />
					<Menu.Divider />
					<BalanceRows balance={selectedBalance} />
					<CashbackClaim />
				</Menu.Dropdown>
			</Menu>
			<WalletButton />
		</div>
	);
};
