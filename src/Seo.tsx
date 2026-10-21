type Props = {
	title: string;
	description?: string;
};

// React 19 hoists these tags into <head>.
export default function SEO({ title, description }: Props) {
	return (
		<>
			<title>{title}</title>
			<meta property="og:title" content={title} />
			{description ? (
				<>
					<meta name="description" content={description} />
					<meta property="og:description" content={description} />
				</>
			) : null}
		</>
	);
}
