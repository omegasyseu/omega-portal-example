import { describe, expect, it } from "vitest";
import {
	brandContentFor,
	lobbyGameFor,
} from "@/providers/brand-content/brand-content.ts";
import type { StrapiBrand } from "@/server/STRAPI/strapi-schemas.ts";

const STRAPI_URL = "https://strapi.example.com";

const brand = (fields: Partial<StrapiBrand> = {}): StrapiBrand => ({
	brandId: 1,
	name: "Omega Wins",
	theme: "DARK",
	logo: null,
	banners: [],
	lobby: [],
	...fields,
});

describe("brandContentFor", () => {
	it("gives a Dark Brand the Dark Theme and a Light Brand the Light Theme", () => {
		expect(
			brandContentFor(brand({ theme: "DARK" }), STRAPI_URL).theme.name,
		).toBe("DARK");
		expect(
			brandContentFor(brand({ theme: "LIGHT" }), STRAPI_URL).theme.name,
		).toBe("LIGHT");
	});

	it("gives a Brand with no content in Strapi the Dark Theme, no name or logo, no banners and no games", () => {
		const content = brandContentFor(undefined, STRAPI_URL);
		expect(content.theme.name).toBe("DARK");
		expect(content.name).toBeUndefined();
		expect(content.logoUrl).toBeUndefined();
		expect(content.banners).toEqual([]);
		expect(content.lobby).toEqual([]);
	});

	it("takes the Brand's name and makes its uploaded logo's address absolute against Strapi", () => {
		const content = brandContentFor(
			brand({ name: "Kambi Casino", logo: { url: "/uploads/logo_1a2b.png" } }),
			STRAPI_URL,
		);
		expect(content.name).toBe("Kambi Casino");
		expect(content.logoUrl).toBe(
			"https://strapi.example.com/uploads/logo_1a2b.png",
		);
	});

	it("puts an uploaded image under the portal's own /strapi path when the image serves Strapi there", () => {
		const content = brandContentFor(
			brand({ logo: { url: "/uploads/logo_1a2b.png" } }),
			"/strapi",
		);
		expect(content.logoUrl).toBe("/strapi/uploads/logo_1a2b.png");
	});

	it("leaves an image already stored elsewhere at its own address", () => {
		const content = brandContentFor(
			brand({ logo: { url: "https://bucket.example.net/logo.png" } }),
			STRAPI_URL,
		);
		expect(content.logoUrl).toBe("https://bucket.example.net/logo.png");
	});

	it("keeps the banners in order, leading to a portal page or a known dialog, with absolute images", () => {
		const content = brandContentFor(
			brand({
				banners: [
					{
						title: "Climb the leaderboard",
						buttonText: "See standings",
						link: "/leaderboard",
						image: { url: "/uploads/leaderboard.avif" },
					},
					{
						title: "Jackpots",
						buttonText: "Play for the jackpot",
						link: "dialog:jackpot",
						image: { url: "/uploads/jackpot.avif" },
					},
				],
			}),
			STRAPI_URL,
		);

		expect(content.banners).toEqual([
			{
				title: "Climb the leaderboard",
				buttonText: "See standings",
				link: { kind: "page", to: "/leaderboard" },
				imageUrl: "https://strapi.example.com/uploads/leaderboard.avif",
			},
			{
				title: "Jackpots",
				buttonText: "Play for the jackpot",
				link: { kind: "dialog", dialog: "jackpot" },
				imageUrl: "https://strapi.example.com/uploads/jackpot.avif",
			},
		]);
	});

	it("drops a banner whose link is neither a portal page nor a known dialog", () => {
		const banner = (link: string) => ({
			title: link,
			buttonText: "Go",
			link,
			image: null,
		});
		const content = brandContentFor(
			brand({
				banners: [
					banner("https://elsewhere.example.com/promo"),
					banner("//elsewhere.example.com/promo"),
					banner("/\\elsewhere.example.com/promo"),
					banner("leaderboard"),
					banner("/leader board"),
					banner("/leaderboard "),
					banner("/\tleaderboard"),
					banner(""),
					banner("dialog:"),
					banner("dialog:cashback"),
					banner("/bonus"),
				],
			}),
			STRAPI_URL,
		);

		expect(content.banners.map(({ title }) => title)).toEqual(["/bonus"]);
	});

	it("drops a banner leading into a Hidden Engage Feature, page or dialog", () => {
		const banner = (link: string) => ({
			title: link,
			buttonText: "Go",
			link,
			image: null,
		});
		const content = brandContentFor(
			brand({
				featureVisibility: { jackpot: false, leaderboard: false },
				banners: [
					banner("dialog:jackpot"),
					banner("/leaderboard?period=WEEKLY"),
					banner("/games?dialog=jackpot"),
					banner("/quest"),
					banner("/bonus"),
				],
			}),
			STRAPI_URL,
		);

		expect(content.banners.map(({ title }) => title)).toEqual([
			"/quest",
			"/bonus",
		]);
	});

	it("shows every Engage Feature unless the Brand hides it", () => {
		expect(brandContentFor(brand(), STRAPI_URL).engageFeatures).toEqual({
			jackpot: true,
			challenge: true,
			levelUp: true,
			quest: true,
			leaderboard: true,
		});
		expect(
			brandContentFor(
				brand({ featureVisibility: { quest: false } }),
				STRAPI_URL,
			).engageFeatures.quest,
		).toBe(false);
	});

	it("reads unpublished or missing relations as empty, not as errors", () => {
		const empty = brandContentFor(
			brand({ logo: null, banners: null, lobby: undefined }),
			STRAPI_URL,
		);
		expect(empty.logoUrl).toBeUndefined();
		expect(empty.banners).toEqual([]);
		expect(empty.lobby).toEqual([]);

		const withoutImages = brandContentFor(
			brand({
				banners: [
					{ title: "Bonus", buttonText: "Claim", link: "/bonus", image: null },
				],
				lobby: [
					{
						provider: "THREEOAKS",
						gameId: "aztec_fire",
						title: "Aztec Fire",
						category: null,
						tile: null,
					},
				],
			}),
			STRAPI_URL,
		);
		expect(withoutImages.banners[0].imageUrl).toBeUndefined();
		expect(withoutImages.lobby).toEqual([
			{
				gameProvider: "THREEOAKS",
				gameId: "aztec_fire",
				title: "Aztec Fire",
				category: undefined,
				image: "",
			},
		]);
	});

	it("keeps the lobby in the order the Brand arranged it, as lobby games with absolute tiles", () => {
		const content = brandContentFor(
			brand({
				lobby: [
					{
						provider: "THREEOAKS",
						gameId: "aztec_fire",
						title: "Aztec Fire",
						category: "slots",
						tile: { url: "/uploads/aztec_fire.avif" },
					},
					{
						provider: "DELASPORT",
						gameId: "delasport",
						title: "Delasport",
						category: "sportsbook",
						tile: { url: "/uploads/delasport.avif" },
					},
					{
						provider: "PRAGMATIC_CASINO_V2",
						gameId: "big_bass",
						title: "Big Bass Splash",
						category: "slots",
						tile: { url: "/uploads/big_bass.avif" },
					},
				],
			}),
			STRAPI_URL,
		);

		expect(content.lobby).toEqual([
			{
				gameProvider: "THREEOAKS",
				gameId: "aztec_fire",
				title: "Aztec Fire",
				category: "slots",
				image: "https://strapi.example.com/uploads/aztec_fire.avif",
			},
			{
				gameProvider: "DELASPORT",
				gameId: "delasport",
				title: "Delasport",
				category: "sportsbook",
				image: "https://strapi.example.com/uploads/delasport.avif",
			},
			{
				gameProvider: "PRAGMATIC_CASINO_V2",
				gameId: "big_bass",
				title: "Big Bass Splash",
				category: "slots",
				image: "https://strapi.example.com/uploads/big_bass.avif",
			},
		]);
	});

	describe("Collections", () => {
		const strapiGame = (provider: string, gameId: string, title: string) => ({
			provider,
			gameId,
			title,
			category: "slots",
			tile: null,
		});
		const LOBBY = [
			strapiGame("THREEOAKS", "aztec_fire", "Aztec Fire"),
			strapiGame("THREEOAKS", "coin_volcano", "Coin Volcano"),
			strapiGame("KAMBI", "KAMBI_GAME_ID", "KAMBI"),
		];
		const slots = { name: "Slots", slug: "slots", icon: "dice" };
		const featured = { name: "Featured", slug: "featured", icon: "star" };
		const gamesOf = (content: ReturnType<typeof brandContentFor>) =>
			content.collections.map(({ slug, name, icon, games }) => [
				slug,
				name,
				icon,
				games.map((game) => game.title),
			]);

		it("gives the Brand's Collections in its order, each holding its lobby games in the Collection's order", () => {
			const content = brandContentFor(
				brand({
					lobby: LOBBY,
					collections: [
						{
							collection: featured,
							games: [{ key: "THREEOAKS:coin_volcano" }],
						},
						{
							collection: slots,
							games: [
								{ key: "THREEOAKS:coin_volcano" },
								{ key: "THREEOAKS:aztec_fire" },
							],
						},
					],
				}),
				STRAPI_URL,
			);

			expect(gamesOf(content)).toEqual([
				["featured", "Featured", "star", ["Coin Volcano"]],
				["slots", "Slots", "dice", ["Coin Volcano", "Aztec Fire"]],
			]);
		});

		it("drops a Collection's games the lobby doesn't list", () => {
			const content = brandContentFor(
				brand({
					lobby: LOBBY,
					collections: [
						{
							collection: slots,
							games: [
								{ key: "THREEOAKS:retired" },
								{ key: "KAMBI:KAMBI_GAME_ID" },
							],
						},
					],
				}),
				STRAPI_URL,
			);

			expect(gamesOf(content)).toEqual([["slots", "Slots", "dice", ["KAMBI"]]]);
		});

		it("drops an entry whose Collection isn't published, and keeps a Collection with no games", () => {
			const content = brandContentFor(
				brand({
					lobby: LOBBY,
					collections: [
						{ collection: null, games: [{ key: "THREEOAKS:aztec_fire" }] },
						{ collection: featured, games: null },
					],
				}),
				STRAPI_URL,
			);

			expect(gamesOf(content)).toEqual([["featured", "Featured", "star", []]]);
		});

		it("draws an icon the portal doesn't know as the dice", () => {
			const content = brandContentFor(
				brand({
					collections: [
						{ collection: { ...featured, icon: "rocket" }, games: [] },
						{ collection: { ...slots, icon: null }, games: [] },
					],
				}),
				STRAPI_URL,
			);

			expect(content.collections.map(({ icon }) => icon)).toEqual([
				"dice",
				"dice",
			]);
		});

		it("gives a Brand with no Collections, or no content, none", () => {
			expect(
				brandContentFor(brand({ collections: null }), STRAPI_URL).collections,
			).toEqual([]);
			expect(brandContentFor(undefined, STRAPI_URL).collections).toEqual([]);
		});
	});

	describe("Payment Methods", () => {
		const OMEGA_BANK = {
			code: "OMEGA_BANK",
			name: "OMEGA Bank",
			logo: { url: "/uploads/omega_bank.png" },
		};
		const EVOUCHER = {
			code: "EVOUCHER",
			name: "E-Voucher",
			logo: { url: "/uploads/evoucher.png" },
		};
		const setting = (
			paymentMethod: {
				code: string;
				name: string;
				logo: { url: string } | null;
			} | null,
			fields: { deposit?: boolean; withdrawal?: boolean } = {},
		) => ({
			deposit: true,
			withdrawal: true,
			name: null,
			logo: null,
			paymentMethod,
			...fields,
		});

		it("carries each method's deposit and withdrawal switches, keyed by its code", () => {
			const content = brandContentFor(
				brand({
					paymentMethods: [
						setting(OMEGA_BANK, { deposit: true, withdrawal: false }),
						setting(EVOUCHER, { deposit: false, withdrawal: true }),
					],
				}),
				STRAPI_URL,
			);

			expect(content.paymentMethods.get("OMEGA_BANK")).toMatchObject({
				deposit: true,
				withdrawal: false,
			});
			expect(content.paymentMethods.get("EVOUCHER")).toMatchObject({
				deposit: false,
				withdrawal: true,
			});
		});

		it("shows a method under the Payment Method's default name and logo, made absolute against Strapi", () => {
			const content = brandContentFor(
				brand({ paymentMethods: [setting(OMEGA_BANK)] }),
				STRAPI_URL,
			);

			expect(content.paymentMethods.get("OMEGA_BANK")).toEqual({
				deposit: true,
				withdrawal: true,
				name: "OMEGA Bank",
				logoUrl: "https://strapi.example.com/uploads/omega_bank.png",
			});
		});

		it("shows a method under the Brand's own name and logo when it gives them", () => {
			const content = brandContentFor(
				brand({
					paymentMethods: [
						{
							...setting(OMEGA_BANK),
							name: "Bank",
							logo: { url: "https://bucket.example.net/kambi_bank.png" },
						},
					],
				}),
				STRAPI_URL,
			);

			expect(content.paymentMethods.get("OMEGA_BANK")).toMatchObject({
				name: "Bank",
				logoUrl: "https://bucket.example.net/kambi_bank.png",
			});
		});

		it("gives a method no logo when neither the Brand nor the Payment Method has one", () => {
			const content = brandContentFor(
				brand({
					paymentMethods: [
						setting({ code: "COINSPAID", name: "CoinsPaid", logo: null }),
					],
				}),
				STRAPI_URL,
			);

			expect(content.paymentMethods.get("COINSPAID")?.logoUrl).toBeUndefined();
		});

		it("ignores a setting whose Payment Method is missing or unpublished", () => {
			const content = brandContentFor(
				brand({
					paymentMethods: [
						setting(null),
						{ ...setting(OMEGA_BANK), paymentMethod: undefined },
						setting(EVOUCHER),
					],
				}),
				STRAPI_URL,
			);

			expect([...content.paymentMethods.keys()]).toEqual(["EVOUCHER"]);
		});

		it("gives a Brand with no Payment Method settings, or no content, none", () => {
			expect(
				brandContentFor(brand({ paymentMethods: null }), STRAPI_URL)
					.paymentMethods.size,
			).toBe(0);
			expect(brandContentFor(undefined, STRAPI_URL).paymentMethods.size).toBe(
				0,
			);
		});
	});
});

describe("lobbyGameFor", () => {
	it("makes a game looked up on its own, for a direct link, into a lobby game with an absolute tile", () => {
		expect(
			lobbyGameFor(
				{
					provider: "DELASPORT",
					gameId: "delasport",
					title: "Delasport",
					category: "sportsbook",
					tile: { url: "/uploads/delasport.avif" },
				},
				STRAPI_URL,
			),
		).toEqual({
			gameProvider: "DELASPORT",
			gameId: "delasport",
			title: "Delasport",
			category: "sportsbook",
			image: "https://strapi.example.com/uploads/delasport.avif",
		});
	});
});
