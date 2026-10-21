import { Button, TextInput } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import classes from "@/components/payments/components/ui/payments.module.css";
import { useDeposit } from "@/server/IPS/deposits";

type Props = {
	code: string;
};

// eVoucher: deposit by redeeming a voucher code.
const EVoucher = ({ code }: Props) => {
	const [value, setValue] = useState("");
	const { mutate, isPending } = useDeposit();

	return (
		<div className={`${classes.panel} ${classes.narrow}`}>
			<TextInput
				value={value}
				onChange={(event) => setValue(event.currentTarget.value)}
				placeholder="E-Voucher Code"
				label="E-Voucher code"
			/>
			<div className={classes.actions}>
				<Button
					onClick={() => {
						mutate({
							evoucher: value,
							paymentMethod: code,
						});
					}}
					disabled={value === "" || isPending}
					loading={isPending}
				>
					Deposit
				</Button>
				<Button variant="default" component={Link} to="/deposit">
					Back
				</Button>
			</div>
		</div>
	);
};

export default EVoucher;
