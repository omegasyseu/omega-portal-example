import { Text, Title } from "@mantine/core";
import classes from "./home.module.css";

// Payment providers whose logos ship in public/sponsors as wordmarks. Skrill's asset is a
// padded square that can't sit in the strip, so it's left out.
const PAYMENT_LOGOS = [
	{ name: "Neteller", src: "/sponsors/Neteller.png" },
	{ name: "Worldpay", src: "/sponsors/worldpay.png" },
	{ name: "PaymentIQ", src: "/sponsors/paymentiq.png" },
	{ name: "OMEGA Bank", src: "/sponsors/OMEGABank.svg" },
] as const;

export function PaymentLogos() {
	return (
		<section className={classes.payments} aria-labelledby="payments-title">
			<div>
				<Title order={2} id="payments-title" className={classes.sectionTitle}>
					Enjoy seamless and secure payments
				</Title>
				<Text className={classes.sectionLead}>
					with a wide range of options
				</Text>
			</div>
			<ul className={classes.logos}>
				{PAYMENT_LOGOS.map(({ name, src }) => (
					<li key={name} className={classes.logo}>
						<img
							src={src}
							alt={name}
							className={classes.logoImage}
							loading="lazy"
						/>
					</li>
				))}
			</ul>
		</section>
	);
}
