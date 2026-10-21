import {
	Box,
	Button,
	Center,
	Group,
	Image,
	Loader,
	Modal,
	Stack,
	Text,
} from "@mantine/core";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { CatchBoundary } from "@tanstack/react-router";
import { type ReactNode, Suspense, useRef } from "react";
import type { AuthStep } from "@/components/auth/auth-steps.ts";
import { ForgotPassword } from "@/components/auth/components/forgot-password";
import { ResetPassword } from "@/components/auth/components/forgot-password/reset-password";
import CodeCompletion from "@/components/auth/forms/code-completion.tsx";
import LoginForm from "@/components/auth/forms/login-form.tsx";
import QuickSignupForm from "@/components/auth/forms/quick-signup.tsx";
import { SignupStep } from "@/components/auth/forms/signup-step.tsx";
import {
	useAuthSearch,
	useCloseAuth,
	useGoToAuthStep,
} from "@/components/auth/hooks/use-auth-dialog.ts";
import { PORTAL_MODAL_CLASS_NAMES } from "@/components/route-modal";
import { useSession } from "@/providers/authentication/authentication.tsx";
import classes from "./auth-modal.module.css";

const DIALOG_WIDTH = 460;
const REGISTRATION_DIALOG_WIDTH = 880;
const REGISTRATION_ART = "/backgrounds/signup-portrait.avif";

type AuthTab = "sign-in" | "sign-up";

// Steps with a tab are sign-in or registration forms: the tabs head the dialog in place
// of a title, and the title only names it for screen readers. Steps without one (code
// entry, forgot and reset password) show their title.
const STEPS: Record<
	AuthStep,
	{ title: string; tab?: AuthTab; content: ReactNode }
> = {
	login: { title: "Sign In", tab: "sign-in", content: <LoginForm /> },
	signup: { title: "Sign Up", tab: "sign-up", content: <SignupStep /> },
	"signup-code": { title: "Verify your account", content: <CodeCompletion /> },
	"quick-signup": {
		title: "Quick sign up",
		tab: "sign-up",
		content: <QuickSignupForm />,
	},
	"quick-signup-code": {
		title: "Verify your account",
		content: <CodeCompletion />,
	},
	"forgot-password": { title: "Forgot password", content: <ForgotPassword /> },
	"reset-password": { title: "Reset password", content: <ResetPassword /> },
};

const AuthTabs = ({ active }: { active: AuthTab }) => {
	const goToStep = useGoToAuthStep();
	const tabProps = (tab: AuthTab) => ({
		className: classes.tab,
		variant: active === tab ? "filled" : "default",
		"aria-pressed": active === tab,
	});

	return (
		<Group grow gap="xs" className={classes.tabs}>
			{/* The selected tab does nothing: on quick sign-up, Sign Up is selected and
			    would otherwise swap the form for the full one, losing what was typed. */}
			<Button
				onClick={() => active !== "sign-up" && goToStep("signup")}
				{...tabProps("sign-up")}
			>
				Sign Up
			</Button>
			<Button
				onClick={() => active !== "sign-in" && goToStep("login")}
				{...tabProps("sign-in")}
			>
				Sign In
			</Button>
		</Group>
	);
};

const StepLoading = () => (
	<Center mih={320}>
		<Loader aria-label="Loading" />
	</Center>
);

// A step that can't load (sign-up needs the brands, country and currencies) fails inside
// the dialog, not across the page under it.
const StepError = ({ onRetry }: { onRetry: () => void }) => (
	<Stack align="center" gap="sm" py="xl" role="alert">
		<Text c="dark.1" ta="center">
			We couldn&#39;t load this step. Check your connection and try again.
		</Text>
		<Button variant="default" onClick={onRetry}>
			Try again
		</Button>
	</Stack>
);

// Try again clears the failed queries as well as the boundary; otherwise a suspense
// query rethrows its cached error straight away.
const StepContent = ({
	step,
	children,
}: {
	step: AuthStep;
	children: ReactNode;
}) => (
	<QueryErrorResetBoundary>
		{({ reset: resetQueries }) => (
			<CatchBoundary
				getResetKey={() => step}
				onCatch={(error) => console.error("Sign-in step failed", step, error)}
				errorComponent={({ reset }) => (
					<StepError
						onRetry={() => {
							resetQueries();
							reset();
						}}
					/>
				)}
			>
				<Suspense fallback={<StepLoading />}>{children}</Suspense>
			</CatchBoundary>
		)}
	</QueryErrorResetBoundary>
);

// The sign-in and sign-up flow as a dialog over whatever page the player is on, as on
// Omega Wins. The page's ?auth= param picks the step; a logged-in player never sees it.
export function AuthModal() {
	const { auth } = useAuthSearch();
	const { session } = useSession();
	const close = useCloseAuth();
	const contentRef = useRef<HTMLDivElement>(null);

	// Escape reaches every open dialog at once. While one opened over this one has focus
	// (a Legal Page from the sign-up form), only that one closes, keeping what was typed.
	const closeUnlessCovered = () => {
		const focusedDialog = document.activeElement?.closest('[role="dialog"]');
		if (focusedDialog && focusedDialog !== contentRef.current) return;
		close();
	};

	if (!auth || session?.user) {
		return null;
	}

	const step = STEPS[auth];
	const isRegistration = step.tab === "sign-up";
	const content = <StepContent step={auth}>{step.content}</StepContent>;

	const size = isRegistration ? REGISTRATION_DIALOG_WIDTH : DIALOG_WIDTH;
	const body = isRegistration ? (
		<Box className={classes.registration}>
			<Image
				src={REGISTRATION_ART}
				alt=""
				visibleFrom="sm"
				className={classes.registrationArt}
			/>
			<Box className={classes.registrationForm}>{content}</Box>
		</Box>
	) : (
		content
	);

	// One dialog for every step, so moving between steps never closes and reopens it.
	return (
		<Modal.Root
			opened
			onClose={closeUnlessCovered}
			size={size}
			centered
			classNames={PORTAL_MODAL_CLASS_NAMES}
		>
			<Modal.Overlay />
			<Modal.Content
				ref={contentRef}
				aria-label={step.tab ? step.title : undefined}
			>
				<Modal.Header>
					{step.tab ? (
						<AuthTabs active={step.tab} />
					) : (
						<Modal.Title>{step.title}</Modal.Title>
					)}
					{/* Focus starts here, as it did with a title: not on a tab, where its
					    ring would look like the selection, nor in a field, which would
					    bring up a phone's keyboard over the form. */}
					<Modal.CloseButton data-autofocus />
				</Modal.Header>
				<Modal.Body>{body}</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
}
