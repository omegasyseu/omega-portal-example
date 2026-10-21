import { Button, Text, Title } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import classes from "./complete-registration.module.css";
import { completeRegistrationDialog } from "./complete-registration-store.ts";

// Shown in place of a payment page's form while the player is QUICK_REG.
export function RegistrationReminder({ action }: { action: string }) {
	return (
		<section
			className={classes.reminder}
			aria-labelledby="registration-reminder"
		>
			<span className={classes.reminderIcon}>
				<IconPencil size={22} aria-hidden />
			</span>
			<Title
				order={2}
				id="registration-reminder"
				className={classes.reminderTitle}
			>
				Finish your registration to {action}
			</Title>
			<Text className={classes.reminderText}>
				Add your name and address first. It takes a minute, and you only do it
				once.
			</Text>
			<Button onClick={completeRegistrationDialog.open}>
				Complete registration
			</Button>
		</section>
	);
}
