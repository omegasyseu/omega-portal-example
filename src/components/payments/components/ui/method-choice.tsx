import classes from "./payments.module.css";

type Props = {
	methods: readonly { value: string; label: string }[];
	selected?: string | null;
	onSelect: (value: string) => void;
};

// Payment methods as tiles to pick from on the page itself (Purchase, Redeem), where the
// method is a form field rather than a page of its own.
export function MethodChoice({ methods, selected, onSelect }: Props) {
	return (
		<div className={classes.tiles}>
			{methods.map((method) => (
				<button
					key={method.value}
					type="button"
					className={classes.tile}
					aria-pressed={selected === method.value}
					onClick={() => onSelect(method.value)}
				>
					<span className={classes.tileRadio} aria-hidden />
					<span className={classes.tileName}>{method.label}</span>
				</button>
			))}
		</div>
	);
}
