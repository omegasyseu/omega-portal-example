import { createFileRoute } from "@tanstack/react-router";
import { PromotionsPage } from "@/components/bonuses/promotions-page.tsx";

// Promotions keeps its /bonus URL; it is personal, so the layout sends visitors to sign in.
export const Route = createFileRoute("/_promotions/bonus/")({
	component: PromotionsPage,
});
