import { Button, Center, Loader, Text, Title } from "@mantine/core";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { CatchBoundary, createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import engage from "@/components/engage/engage.module.css";
import ReferByEmailSection from "@/components/profile/refer-a-friend/components/refer-by-email-section.tsx";
import ReferralCodeSection from "@/components/profile/refer-a-friend/components/referal-code-section.tsx";
import RefereeTable from "@/components/profile/refer-a-friend/components/referee-table.tsx";
import classes from "@/components/profile/refer-a-friend/refer-a-friend.module.css";
import { referralLinksOptions } from "@/server/IPS/profile-info/get-referral-links.ts";

// IPS can refuse the referral details, for example when the brand has no referral
// programme or the player isn't eligible for it, or the request can fail. Either way the
// player can't refer anyone here, so the page says so instead of showing the sections.
const ReferralsUnavailable = ({ onRetry }: { onRetry: () => void }) => (
	<section
		className={engage.empty}
		aria-labelledby="referrals-unavailable"
		role="alert"
	>
		<Title order={2} id="referrals-unavailable" className={engage.panelTitle}>
			Refer a friend isn't available right now
		</Title>
		<Text mt="xs" mb="md">
			We couldn't load your referral details. Try again, or contact Customer
			Support if this keeps happening.
		</Text>
		<Button variant="default" onClick={onRetry}>
			Try again
		</Button>
	</section>
);

const ReferralSections = () => (
	<>
		<div className={classes.panels}>
			<ReferralCodeSection />
			<ReferByEmailSection />
		</div>
		<section className={engage.panel} aria-labelledby="your-referrals-title">
			<Title order={2} id="your-referrals-title" className={engage.panelTitle}>
				Your referrals
			</Title>
			<RefereeTable />
		</section>
	</>
);

const ReferAFriend = () => {
	return (
		<div className={engage.page}>
			<header>
				<Title order={1} className={engage.title}>
					Refer a friend
				</Title>
				<Text className={engage.lead}>
					Share your code or invite friends by email, then follow their progress
					below.
				</Text>
			</header>
			{/* The code is read with a suspense query, which throws when IPS refuses it. The
			    sections then give way to the explanation; Try again clears the failed query
			    and asks for it again. */}
			<QueryErrorResetBoundary>
				{({ reset: resetQueries }) => (
					<CatchBoundary
						getResetKey={() => "referral-links"}
						onCatch={(error) =>
							console.error("Referral details failed to load", error)
						}
						errorComponent={({ reset }) => (
							<ReferralsUnavailable
								onRetry={() => {
									resetQueries();
									reset();
								}}
							/>
						)}
					>
						<Suspense
							fallback={
								<Center py="xl">
									<Loader aria-label="Loading your referral details" />
								</Center>
							}
						>
							<ReferralSections />
						</Suspense>
					</CatchBoundary>
				)}
			</QueryErrorResetBoundary>
		</div>
	);
};

export const Route = createFileRoute("/_authenticated/refer-a-friend/")({
	component: ReferAFriend,
	// Starts the request while the page loads; prefetchQuery never throws, so a refusal
	// reaches the page's own error boundary rather than the router's error screen.
	loader: ({
		context: {
			queryClient,
			authentication: { session },
		},
	}) => {
		void queryClient.prefetchQuery(
			referralLinksOptions({ sessionKey: session?.user?.sessionKey }),
		);
	},
});
