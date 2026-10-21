import { createFileRoute } from "@tanstack/react-router";
import { ExploreCollections } from "@/components/home/explore-collections.tsx";
import classes from "@/components/home/home.module.css";
import { HomeHero } from "@/components/home/home-hero.tsx";
import { HomeJackpot } from "@/components/home/home-jackpot.tsx";
import { PaymentLogos } from "@/components/home/payment-logos.tsx";
import { PromoCards } from "@/components/home/promo-cards.tsx";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";

// The home page, as on the Omega Wins home: hero, "Explore collections", promo cards with
// the jackpot widget (unless the Brand hides Jackpot), and the payment logos.
const HomePage = () => {
	const { engageFeatures } = useBrandContent();
	return (
		<div className={classes.page}>
			<div className={classes.content}>
				<HomeHero />
				<ExploreCollections />
				<div className={classes.promoRow}>
					<PromoCards />
					{engageFeatures.jackpot ? <HomeJackpot /> : null}
				</div>
				<PaymentLogos />
			</div>
		</div>
	);
};

export const Route = createFileRoute("/")({
	component: HomePage,
});
