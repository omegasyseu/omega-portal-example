import {
	ActionIcon,
	Button,
	Group,
	Text,
	TextInput,
	Title,
	UnstyledButton,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import GameCard from "@/components/games/game-card";
import { pickFavourites } from "@/components/games/lobby-model.ts";
import { useGetFavoriteGames } from "@/components/games/queries/fetch-game-status.ts";
import { PaymentMethodLogo } from "@/components/payments/components/ui/payment-method-logo.tsx";
import {
	type PaymentMethodDisplay,
	shownPaymentMethod,
} from "@/components/payments/shown-payment-methods.ts";
import { AMOUNT } from "@/constants/games.ts";
import { PAYMENT_METHOD_CODE } from "@/constants/payments";
import { useFormat } from "@/hooks/use-format";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { useQuickDeposit } from "@/server/IPS/deposits";
import { useGetDepositMethods } from "@/server/IPS/deposits/get-deposit-methods.ts";
import classes from "./quick-deposit.module.css";

// Favourite-game tiles, at the tile's 3:4 ratio.
const FAVOURITE_TILE_WIDTH = 105;
const FAVOURITE_TILE_HEIGHT = 140;
const FAVOURITE_GAMES_SHOWN = 3;

type Deposit = ReturnType<typeof useQuickDeposit>;

// A method's logo, or for a method without one, a neutral icon and its name.
const MethodButton = ({
	display: { name, logoUrl },
	isPressed,
	onClick,
}: {
	display: PaymentMethodDisplay;
	isPressed: boolean;
	onClick: () => void;
}) => (
	<UnstyledButton
		onClick={onClick}
		aria-pressed={isPressed}
		className={classes.method}
	>
		<PaymentMethodLogo
			logoUrl={logoUrl}
			alt={name}
			className={classes.methodLogo}
		/>
		{logoUrl ? null : <span className={classes.methodName}>{name}</span>}
	</UnstyledButton>
);

// The voucher code field; it starts empty each time the method is opened.
const VoucherForm = ({ deposit }: { deposit: Deposit }) => {
	const [eVoucher, setEvoucher] = useState("");
	return (
		<Group gap="xs" wrap="nowrap">
			<TextInput
				aria-label="Voucher code"
				placeholder="Voucher code"
				value={eVoucher}
				onChange={(e) => setEvoucher(e.currentTarget.value)}
			/>
			<ActionIcon
				aria-label="Redeem voucher"
				loading={deposit.isPending}
				size="input-sm"
				disabled={eVoucher === "" || deposit.isPending}
				onClick={() =>
					deposit.mutate({
						evoucher: eVoucher,
						paymentMethod: PAYMENT_METHOD_CODE.EVOUCHER,
					})
				}
			>
				<IconCheck aria-hidden />
			</ActionIcon>
		</Group>
	);
};

const OmegaBankAmounts = ({ deposit }: { deposit: Deposit }) => {
	const { formatCurrencyFromMap } = useFormat();
	const { selectedAccount } = useGeneralInfo();
	return (
		<Group gap="xs">
			<Text className={classes.currency}>
				{formatCurrencyFromMap(selectedAccount?.currency)}
			</Text>
			{AMOUNT.map((amount) => (
				<Button
					disabled={deposit.isPending}
					loading={deposit.isPending}
					key={`${amount.label}-${amount.value}`}
					variant="default"
					onClick={() =>
						deposit.mutate({
							amount: amount.value,
							paymentMethod: PAYMENT_METHOD_CODE.OMEGA_BANK,
						})
					}
				>
					{amount.label}
				</Button>
			))}
		</Group>
	);
};

// Deposit by voucher or OMEGA Bank without leaving the game, for each that IPS offers the
// player and the Brand shows for deposits, under the Brand's name and logo for it.
// Neither shows until IPS's methods have loaded.
const QuickDeposit = () => {
	const deposit = useQuickDeposit();
	const { data } = useGetDepositMethods();
	const { paymentMethods } = useBrandContent();
	const offeredCodes = data?.offeredCodes ?? [];
	const voucher = shownPaymentMethod(
		PAYMENT_METHOD_CODE.EVOUCHER,
		offeredCodes,
		paymentMethods,
		"deposit",
	);
	const omegaBank = shownPaymentMethod(
		PAYMENT_METHOD_CODE.OMEGA_BANK,
		offeredCodes,
		paymentMethods,
		"deposit",
	);
	const [isVoucherOpen, toggleVoucher] = useToggle([false, true]);
	const [isOmegaBankOpen, toggleOmegaBank] = useToggle([false, true]);

	if (!voucher && !omegaBank) {
		return null;
	}

	return (
		<section className={classes.panel} aria-labelledby="quick-deposit">
			<Title order={2} id="quick-deposit" className={classes.title}>
				Quick deposit
			</Title>
			<Group gap="sm">
				{voucher && !isOmegaBankOpen ? (
					<MethodButton
						display={voucher}
						isPressed={isVoucherOpen}
						onClick={() => toggleVoucher()}
					/>
				) : null}
				{omegaBank && !isVoucherOpen ? (
					<MethodButton
						display={omegaBank}
						isPressed={isOmegaBankOpen}
						onClick={() => toggleOmegaBank()}
					/>
				) : null}
				{isVoucherOpen ? <VoucherForm deposit={deposit} /> : null}
				{isOmegaBankOpen ? <OmegaBankAmounts deposit={deposit} /> : null}
			</Group>
		</section>
	);
};

// The first few games the player hearted (♥), to switch to without going back to the
// lobby.
const FavouriteGames = () => {
	const { data: favourites } = useGetFavoriteGames();
	const { lobby } = useBrandContent();
	const games = pickFavourites(lobby, favourites?.games ?? []).slice(
		0,
		FAVOURITE_GAMES_SHOWN,
	);

	if (games.length === 0) {
		return null;
	}
	return (
		<section className={classes.panel} aria-labelledby="favourite-games">
			<Title order={2} id="favourite-games" className={classes.title}>
				Favourites
			</Title>
			<Group gap="sm" wrap="nowrap">
				{games.map((game) => (
					<GameCard
						key={`${game.gameId}-${game.title}`}
						game={game}
						boxProps={{ w: FAVOURITE_TILE_WIDTH, h: FAVOURITE_TILE_HEIGHT }}
					/>
				))}
			</Group>
		</section>
	);
};

// Under the game: quick deposit beside the player's favourite games.
const QuickDepositAndFavourites = () => (
	<div className={classes.quickDeposit}>
		<QuickDeposit />
		<FavouriteGames />
	</div>
);

export default QuickDepositAndFavourites;
