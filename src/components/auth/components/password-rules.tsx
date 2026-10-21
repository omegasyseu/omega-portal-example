import { VisuallyHidden } from "@mantine/core";
import { IconCheck, IconCircle, IconX } from "@tabler/icons-react";
import {
	meetsRule,
	type PasswordRule,
} from "@/components/auth/password-policy.ts";
import classes from "./password-rules.module.css";

const RULE_ICON_SIZE = 14;

const ruleIcon = (isMet: boolean, isMissed: boolean) => {
	if (isMet) return IconCheck;
	return isMissed ? IconX : IconCircle;
};

// The brand's password rules under the field, ticking off as the player types. Once the
// form has refused the password, the rules still missing turn red with a cross. Each
// rule says whether it is met, for screen readers too.
export function PasswordRules({
	rules,
	value,
	isRefused = false,
}: {
	rules: PasswordRule[];
	value: string;
	isRefused?: boolean;
}) {
	if (rules.length === 0) return null;
	return (
		// The list role survives list-style: none in Safari.
		// biome-ignore lint/a11y/noRedundantRoles: see above
		<ul className={classes.rules} role="list">
			{rules.map((rule) => {
				const isMet = meetsRule(rule, value);
				const isMissed = isRefused && !isMet;
				const Icon = ruleIcon(isMet, isMissed);
				return (
					<li
						key={rule.id}
						className={classes.rule}
						data-met={isMet || undefined}
						data-missed={isMissed || undefined}
					>
						<Icon size={RULE_ICON_SIZE} aria-hidden />
						<span>
							{rule.label}
							<VisuallyHidden>{isMet ? ", met" : ", not met"}</VisuallyHidden>
						</span>
					</li>
				);
			})}
		</ul>
	);
}
