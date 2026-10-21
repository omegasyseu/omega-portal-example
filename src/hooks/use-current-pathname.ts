import { useLocation } from "@tanstack/react-router";

export const useCurrentPathname = () =>
	useLocation({ select: (location) => location.pathname });
