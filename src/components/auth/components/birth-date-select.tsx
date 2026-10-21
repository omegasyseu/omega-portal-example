import { Input, type SelectProps, SimpleGrid } from "@mantine/core";
import { type FocusEvent, useCallback, useId } from "react";
import {
	adultBirthYear,
	birthYears,
	daysInMonth,
} from "@/components/auth/signup-model.ts";
import { PortalSelect } from "@/ui/form-inputs";
import inputClasses from "@/ui/form-inputs/form-inputs.module.css";

const MONTHS = Array.from({ length: 12 }, (_, index) => `${index + 1}`);

const padded = (value: string) => ({ value, label: value.padStart(2, "0") });

// Scrolls a select's open list so the option with this value sits in the middle.
const centreOption = (viewport: HTMLElement, value: string) => {
	const option = viewport.querySelector<HTMLElement>(`[value="${value}"]`);
	if (!option) return;
	const offset =
		option.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
	viewport.scrollTop +=
		offset - (viewport.clientHeight - option.offsetHeight) / 2;
};

type Props = {
	// Each select's props from form.getInputProps, so its value and change flow through
	// the form.
	month: SelectProps;
	day: SelectProps;
	year: SelectProps;
	// The date's own error (too young, an impossible day), shown once under all three,
	// which all turn red.
	error?: string;
};

// Date of birth as three selects, MM / DD / YYYY, as on Omega Wins. Days follow the
// chosen month and year. Years run up to this one, and the list opens at the year an
// 18-year-old was born; a stored year outside the list (the profile shows whatever IPS
// holds) is still shown.
export function BirthDateSelect({ month, day, year, error }: Props) {
	const labelId = useId();
	const today = new Date();
	const allowedYears = birthYears(today);
	const defaultYear = adultBirthYear(today);
	const storedYear = typeof year.value === "string" ? year.value : "";
	const years =
		storedYear && !allowedYears.includes(storedYear)
			? [storedYear, ...allowedYears]
			: allowedYears;

	// While no year is chosen, the list opens with the default year in view. The closed
	// list stays mounted but hidden, so it scrolls each time it is shown (its height goes
	// from nothing to something).
	const openAtDefaultYear = useCallback(
		(viewport: HTMLDivElement | null) => {
			if (!viewport || storedYear) return;
			let wasHidden = true;
			const observer = new ResizeObserver(() => {
				const isHidden = viewport.clientHeight === 0;
				if (wasHidden && !isHidden) centreOption(viewport, defaultYear);
				wasHidden = isHidden;
			});
			observer.observe(viewport);
			return () => observer.disconnect();
		},
		[storedYear, defaultYear],
	);

	// A whole year typed into the field is kept when the player leaves it, as if chosen
	// from the list. A partial one is cleared rather than guessed.
	const keepTypedYear = (event: FocusEvent<HTMLInputElement>) => {
		const typed = event.currentTarget.value.trim();
		if (typed !== storedYear && years.includes(typed)) {
			year.onChange?.(typed, { value: typed, label: typed });
		}
		year.onBlur?.(event);
	};
	const dayCount = daysInMonth(
		Number(month.value) || undefined,
		Number(year.value) || undefined,
	);
	const days = Array.from({ length: dayCount }, (_, index) => `${index + 1}`);

	return (
		<Input.Wrapper
			label="Date of Birth"
			labelElement="div"
			labelProps={{ id: labelId }}
			error={error}
			// Labelled like the portal's other fields.
			classNames={{ label: inputClasses.label, error: inputClasses.error }}
		>
			{/* The three selects are one field, named by the label above them. */}
			<SimpleGrid cols={3} spacing="xs" role="group" aria-labelledby={labelId}>
				<PortalSelect
					aria-label="Birth month"
					placeholder="MM"
					data={MONTHS.map(padded)}
					allowDeselect={false}
					{...month}
					error={Boolean(error)}
				/>
				<PortalSelect
					aria-label="Birth day"
					placeholder="DD"
					data={days.map(padded)}
					allowDeselect={false}
					{...day}
					error={Boolean(error)}
				/>
				<PortalSelect
					aria-label="Birth year"
					placeholder="YYYY"
					data={years}
					searchable
					// The first matching year is highlighted as the player types, so Enter
					// chooses it.
					selectFirstOptionOnChange
					scrollAreaProps={{ viewportRef: openAtDefaultYear }}
					allowDeselect={false}
					{...year}
					onBlur={keepTypedYear}
					error={Boolean(error)}
				/>
			</SimpleGrid>
		</Input.Wrapper>
	);
}
