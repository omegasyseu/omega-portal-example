import {
	Button,
	NumberFormatter,
	Text,
	TextInput,
	VisuallyHidden,
} from "@mantine/core";
import type { ComponentProps } from "react";
import { AMOUNT } from "@/constants/games.ts";
import { getCurrencySymbol } from "@/hooks/use-format/fomatCurrencySymbol";
import { amountLabel } from "./amount-label";
import classes from "./payments.module.css";

type Props = {
	label: string;
	currency?: string;
	// The field's props from `form.getInputProps`, so validation still shows.
	inputProps: ComponentProps<typeof TextInput>;
	onPreset: (amount: string) => void;
	// The method's daily limit, shown under the field when known.
	dailyLimit?: number | string;
};

// An amount field with one-tap presets, like the Omega Wins Withdraw dialog. Typing any
// other amount still works.
export function AmountField({
	label,
	currency,
	inputProps,
	onPreset,
	dailyLimit,
}: Props) {
	const symbol = getCurrencySymbol(currency);
	return (
		<>
			<TextInput
				type="number"
				label={label}
				placeholder="Amount"
				leftSection={symbol}
				// The section is a square the input's height, which fits "€" or "R$" but not "ORD".
				leftSectionWidth={
					symbol.length > 2
						? `calc(${symbol.length}ch + var(--mantine-spacing-md))`
						: undefined
				}
				{...inputProps}
			/>
			<fieldset className={classes.presets}>
				<VisuallyHidden component="legend">Preset amounts</VisuallyHidden>
				{AMOUNT.map(({ label: preset, value }) => (
					<Button
						key={value}
						variant="default"
						size="compact-md"
						className={classes.preset}
						aria-pressed={`${inputProps.value}` === value}
						onClick={() => onPreset(value)}
					>
						{amountLabel(symbol, preset)}
					</Button>
				))}
			</fieldset>
			{dailyLimit !== undefined ? (
				<Text className={classes.note}>
					Daily limit for {currency}:{" "}
					<NumberFormatter
						prefix={amountLabel(symbol, "")}
						thousandSeparator
						value={dailyLimit}
					/>
				</Text>
			) : null}
		</>
	);
}
