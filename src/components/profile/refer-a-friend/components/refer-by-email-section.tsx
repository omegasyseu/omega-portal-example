import { Button, Fieldset, TextInput, Title } from "@mantine/core";
import engage from "@/components/engage/engage.module.css";
import { useReferAFriend } from "@/components/profile/refer-a-friend/hooks/use-refer-a-friend.tsx";
import classes from "@/components/profile/refer-a-friend/refer-a-friend.module.css";
import { useMantineForm } from "@/hooks/use-form";
import { referFriendFormData } from "@/schemas-types";

const ReferByEmailSection = () => {
	const { mutate, isPending } = useReferAFriend();

	const form = useMantineForm({
		validate: referFriendFormData,
		initialValues: {
			notificationTarget: "EMAIL",
			emails: [{ email: "" }, { email: "" }],
		},
	});

	console.log({
		errors: form.errors,
	});

	return (
		<section className={engage.panel} aria-labelledby="invite-by-email-title">
			<Title order={2} id="invite-by-email-title" className={engage.panelTitle}>
				Invite by email
			</Title>
			<form
				id={"refer-a-friend"}
				className={classes.form}
				onSubmit={form.onSubmit((e) => {
					mutate({
						notificationTarget: `${e.notificationTarget}`,
						emails: e.emails.map((email) => email.email).join(","),
					});
				})}
			>
				<Fieldset variant="unstyled" className={classes.emails}>
					{form.values.emails.map((_field, index) => (
						<TextInput
							// biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable id
							key={index}
							// Not type="email": the browser's own check would run before the form's.
							inputMode="email"
							label={`Friend's email ${index + 1}`}
							placeholder="name@example.com"
							autoComplete="off"
							spellCheck={false}
							{...form.getInputProps(`emails.${index}.email`)}
						/>
					))}
				</Fieldset>
				<Button
					form={"refer-a-friend"}
					loading={isPending}
					type="submit"
					className={classes.submit}
				>
					Invite your friends
				</Button>
			</form>
		</section>
	);
};

export default ReferByEmailSection;
