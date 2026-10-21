import { describe, expect, it } from "vitest";
import { shownEngageFeatures } from "@/components/engage/engage-features.ts";
import {
	buildNavigation,
	isGamePath,
	isLinkActive,
	isMenuSlot,
} from "@/layout/shell/navigation-model.ts";

const realMoneyPlayer = {
	isLoggedIn: true,
	isSocialBrand: false,
	gameCollections: [
		{ slug: "slots", name: "Slots", icon: "dice" },
		{ slug: "sports", name: "Sports", icon: "dice" },
	],
	engageFeatures: shownEngageFeatures({}),
} as const;

describe("buildNavigation", () => {
	it("lists the Social Center for a logged-in real-money player", () => {
		const { socialCenter } = buildNavigation(realMoneyPlayer);

		expect(socialCenter.map((item) => [item.label, item.to])).toEqual([
			["Promotions", "/bonus"],
			["Jackpot", "/jackpot"],
			["Challenge", "/challenges"],
			["Level Up", "/levelup"],
			["Quest", "/quest"],
			["Leaderboard", "/leaderboard"],
			["Refer a friend", "/refer-a-friend"],
		]);
	});

	it("lists Deposit and Withdraw apart for a logged-in real-money player", () => {
		const { payments } = buildNavigation(realMoneyPlayer);

		expect(payments.map((item) => [item.label, item.to])).toEqual([
			["Deposit", "/deposit"],
			["Withdraw", "/withdraw"],
		]);
	});

	it("offers Purchase and Redeem instead of Deposit and Withdraw on a social brand", () => {
		const { payments } = buildNavigation({
			...realMoneyPlayer,
			isSocialBrand: true,
		});

		expect(payments.map((item) => [item.label, item.to])).toEqual([
			["Purchase", "/purchase"],
			["Redeem", "/redeem"],
		]);
	});

	it("shows no payment links until the visitor logs in", () => {
		const { payments } = buildNavigation({
			...realMoneyPlayer,
			isLoggedIn: false,
		});

		expect(payments).toEqual([]);
	});

	it("gates personal Social Center items, Quest among them, behind sign-in for a logged-out visitor", () => {
		const { socialCenter } = buildNavigation({
			...realMoneyPlayer,
			isLoggedIn: false,
		});

		expect(
			socialCenter.filter((item) => !item.gated).map((item) => item.label),
		).toEqual(["Leaderboard"]);
	});

	it("lists All Games then one link per Collection the Brand shows, in its order, with its icon", () => {
		const { games } = buildNavigation({
			...realMoneyPlayer,
			gameCollections: [
				{ slug: "featured", name: "Featured", icon: "star" },
				{ slug: "slots", name: "Slots", icon: "dice" },
			],
		});

		expect(games).toEqual([
			{ key: "all", label: "All Games" },
			{
				key: "featured",
				label: "Featured",
				collection: "featured",
				icon: "star",
			},
			{ key: "slots", label: "Slots", collection: "slots", icon: "dice" },
		]);
	});

	it("lists All Games only for a Brand with no Collections", () => {
		const { games } = buildNavigation({
			...realMoneyPlayer,
			gameCollections: [],
		});

		expect(games).toEqual([{ key: "all", label: "All Games" }]);
	});

	const viewersAndCallsToAction = [
		[
			"a logged-out visitor",
			{ isLoggedIn: false, isSocialBrand: false },
			["Register", "/signup"],
		],
		[
			"a real-money player",
			{ isLoggedIn: true, isSocialBrand: false },
			["Deposit", "/deposit"],
		],
		[
			"a social-brand player",
			{ isLoggedIn: true, isSocialBrand: true },
			["Buy Coins", "/purchase"],
		],
	] as const;

	it.each(viewersAndCallsToAction)(
		"gives the header the right call to action for %s",
		(_who, viewer, [label, to]) => {
			const { callToAction } = buildNavigation({
				...realMoneyPlayer,
				...viewer,
			});

			expect([callToAction.label, callToAction.to]).toEqual([label, to]);
		},
	);

	it.each(viewersAndCallsToAction)(
		"starts the bottom nav for %s with the right call to action",
		(_who, viewer, firstSlot) => {
			const { bottomNav } = buildNavigation({ ...realMoneyPlayer, ...viewer });

			expect(bottomNav.map((slot) => [slot.label, slot.to])).toEqual([
				firstSlot,
				["Home", "/"],
				["Promotions", "/bonus"],
				["Games", "/games"],
				["Menu", undefined],
			]);
		},
	);

	it("groups the footer into policies, other pages and games", () => {
		const { footer } = buildNavigation(realMoneyPlayer);

		expect(
			footer.map((column) => [column.title, column.links.map((l) => l.label)]),
		).toEqual([
			[
				"Policies & Terms",
				[
					"Gaming Rules",
					"Player Protection Information",
					"Terms and Conditions",
					"Privacy Policy",
					"Complaints and Contact",
					"Responsible Gaming",
				],
			],
			["Other pages", ["Promotions", "Leaderboard", "Challenge", "Jackpot"]],
			["Games", ["All Games", "Slots", "Sports"]],
		]);
	});

	it.each([
		["a signed-in player", true],
		["a signed-out visitor", false],
	])("links the footer to the five Legal Pages for %s", (_who, isLoggedIn) => {
		const [policies] = buildNavigation({
			...realMoneyPlayer,
			isLoggedIn,
		}).footer;

		expect(
			policies.links.map((link) => {
				if (link.kind === "legal") return [link.label, link.key];
				if (link.kind === "page") return [link.label, link.to, link.gated];
				return [link.label];
			}),
		).toEqual([
			["Gaming Rules", "gaming-rules"],
			["Player Protection Information", "player-protection"],
			["Terms and Conditions", "terms"],
			["Privacy Policy", "privacy"],
			["Complaints and Contact", "complaints"],
			["Responsible Gaming", "/responsible-gaming", !isLoggedIn],
		]);
	});

	it("gates the footer's personal pages for a logged-out visitor", () => {
		const { footer } = buildNavigation({
			...realMoneyPlayer,
			isLoggedIn: false,
		});
		const gatedLabels = footer
			.flatMap((column) => column.links)
			.filter((link) => link.kind === "page" && link.gated)
			.map((link) => link.label);

		expect(gatedLabels).toEqual([
			"Responsible Gaming",
			"Promotions",
			"Challenge",
			"Jackpot",
		]);
	});

	it("leaves a Hidden Engage Feature out of the Social Center and the footer", () => {
		const { socialCenter, footer, bottomNav } = buildNavigation({
			...realMoneyPlayer,
			engageFeatures: shownEngageFeatures({
				featureVisibility: { jackpot: false, leaderboard: false, quest: false },
			}),
		});

		expect(socialCenter.map((item) => item.label)).toEqual([
			"Promotions",
			"Challenge",
			"Level Up",
			"Refer a friend",
		]);
		expect(footer[1].links.map((link) => link.label)).toEqual([
			"Promotions",
			"Challenge",
		]);
		expect(bottomNav.map((slot) => slot.label)).toEqual([
			"Deposit",
			"Home",
			"Promotions",
			"Games",
			"Menu",
		]);
	});

	it("keeps Promotions and Refer a friend with every Engage Feature hidden", () => {
		const { socialCenter } = buildNavigation({
			...realMoneyPlayer,
			engageFeatures: shownEngageFeatures({
				featureVisibility: {
					jackpot: false,
					challenge: false,
					levelUp: false,
					quest: false,
					leaderboard: false,
				},
			}),
		});

		expect(socialCenter.map((item) => item.label)).toEqual([
			"Promotions",
			"Refer a friend",
		]);
	});

	it("gates nothing for a logged-in player", () => {
		const { socialCenter } = buildNavigation(realMoneyPlayer);

		expect(socialCenter.some((item) => item.gated)).toBe(false);
	});
});

describe("isLinkActive", () => {
	const linksOf = (navigation: ReturnType<typeof buildNavigation>) => [
		...navigation.socialCenter,
		...navigation.bottomNav,
	];
	const linkKeyed = (
		key: string,
		navigation = buildNavigation(realMoneyPlayer),
	) => {
		const link = linksOf(navigation).find((item) => item.key === key);
		if (!link) {
			throw new Error(`No shell link with key ${key}`);
		}
		return link;
	};
	const { callToAction } = buildNavigation(realMoneyPlayer);
	const promotions = linkKeyed("promotions");

	it.each(["/bonus", "/bonus/details"])(
		"marks a link active on %s",
		(pathname) => {
			expect(isLinkActive(promotions, pathname)).toBe(true);
		},
	);

	it("leaves a link inactive on another page", () => {
		expect(isLinkActive(promotions, "/games")).toBe(false);
	});

	it("only marks Home active on the home page itself", () => {
		const home = linkKeyed("home");

		expect([isLinkActive(home, "/"), isLinkActive(home, "/games")]).toEqual([
			true,
			false,
		]);
	});

	it("never marks a gated link active", () => {
		const visitorNavigation = buildNavigation({
			...realMoneyPlayer,
			isLoggedIn: false,
		});

		expect(
			isLinkActive(linkKeyed("promotions", visitorNavigation), "/bonus"),
		).toBe(false);
	});

	it("never marks the menu slot active", () => {
		expect(isLinkActive(linkKeyed("menu"), "/")).toBe(false);
	});

	it("never marks the call to action active, even on its own page", () => {
		expect(isLinkActive(callToAction, "/deposit")).toBe(false);
	});

	it("marks Jackpot active while its dialog is open, on any page", () => {
		const jackpot = linkKeyed("jackpot");

		expect([
			isLinkActive(jackpot, "/games", "jackpot"),
			isLinkActive(jackpot, "/games", "challenges"),
			isLinkActive(jackpot, "/games"),
		]).toEqual([true, false, false]);
	});

	it("doesn't mark a page link active just because a dialog is open", () => {
		expect(isLinkActive(promotions, "/games", "jackpot")).toBe(false);
	});
});

describe("isMenuSlot", () => {
	it("recognises only the menu slot in the bottom nav", () => {
		const { bottomNav } = buildNavigation(realMoneyPlayer);

		expect(bottomNav.filter(isMenuSlot).map((slot) => slot.label)).toEqual([
			"Menu",
		]);
	});
});

describe("isGamePath", () => {
	it.each([
		["/games/aztec_fire", true],
		["/games/aztec_fire/", true],
		["/games", false],
		["/games/", false],
		["/gamesfoo", false],
		["/", false],
	])("treats %s as a game page: %s", (pathname, expected) => {
		expect(isGamePath(pathname)).toBe(expected);
	});
});
