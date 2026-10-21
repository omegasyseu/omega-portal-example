import { Anchor, Button, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
	rememberCookieNoticeDismissed,
	wasCookieNoticeDismissed,
} from "@/components/cookie-notice/cookie-notice-dismissal.ts";
import { SHELL_CHROME } from "@/layout/shell/shell-chrome.ts";
import classes from "./cookie-notice.module.css";

// The Cookie Notice: shown on every page until the visitor dismisses it. It informs and
// blocks nothing, so it is a plain landmark rather than a dialog or an alert.
export function CookieNotice() {
	const [isDismissed, setIsDismissed] = useState(wasCookieNoticeDismissed);

	if (isDismissed) return null;

	const dismiss = () => {
		rememberCookieNoticeDismissed();
		setIsDismissed(true);
	};

	return (
		<section
			aria-label="Cookie notice"
			className={classes.notice}
			{...SHELL_CHROME}
		>
			<Group gap="sm" wrap="nowrap" justify="space-between">
				<Text size="sm" className={classes.text}>
					We use essential cookies to keep you signed in and the site working.{" "}
					<Anchor
						component={Link}
						to="/legal/privacy"
						size="sm"
						underline="always"
					>
						Privacy Policy
					</Anchor>
				</Text>
				<Button size="xs" onClick={dismiss} className={classes.dismiss}>
					OK
				</Button>
			</Group>
		</section>
	);
}
