import { Box, Button, Group, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCoins } from "@tabler/icons-react";
import classes from "@/components/payments/components/ui/payments.module.css";
import { PortalModal } from "@/components/route-modal";
import { PAYMENT_METHOD_CODE } from "@/constants/payments";
import { getCurrencySymbol } from "@/hooks/use-format/fomatCurrencySymbol";
import { formatNumber } from "@/hooks/use-format/formatNumber";
import type {
	PackageCurrencyType,
	PackageType,
} from "@/schemas-types/packages";
import { useBuyPackage } from "@/server/IPS/deposits/use-buy-package.tsx";

type Props = {
	packages: PackageType[];
	purchaseMethod?: string;
};

const PACKAGE_ICON_SIZE = 20;

// Coin packages to buy, each with its coins and a Buy Now button.
const PackagesCard = ({ packages, purchaseMethod }: Props) => {
	const { mutate } = useBuyPackage();
	const [opened, { open, close }] = useDisclosure(false);

	const handleBuyNow = async (item: PackageType) => {
		if (purchaseMethod === PAYMENT_METHOD_CODE.PAYMENTIQ_ALL) {
			// Open the modal and return
			open();
			return;
		}

		return mutate({
			paymentMethod: `${purchaseMethod}`,
			currency: `${item?.purchaseCurrency}`,
			packageId: String(item?.packageId),
		});
	};

	return (
		<>
			<ul className={classes.packages}>
				{packages.map((item) => (
					<li key={item?.packageId} className={classes.panel}>
						<Group gap="xs" wrap="nowrap">
							<span className={classes.packageIcon}>
								<IconCoins size={PACKAGE_ICON_SIZE} aria-hidden />
							</span>
							<Title order={2} className={classes.panelTitle}>
								{item?.name}
							</Title>
						</Group>
						{item?.description ? (
							<Text className={classes.lead}>{item.description}</Text>
						) : null}
						{item?.currencies?.map(
							(currencyItem: PackageCurrencyType, index: number) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: index disambiguates repeated currencies
								<div key={`${currencyItem.currency}-${index}`}>
									{currencyItem.realCoin != null && (
										<Text className={classes.coins}>
											{formatNumber(currencyItem.realCoin)}{" "}
											{currencyItem.currency} Coins
										</Text>
									)}
									{currencyItem.bonusCoin != null && (
										<Text className={classes.coins}>
											{formatNumber(currencyItem.bonusCoin)}{" "}
											{currencyItem.currency} Coins
										</Text>
									)}
								</div>
							),
						)}
						<Button mt="auto" onClick={() => handleBuyNow(item)}>
							Buy Now for {getCurrencySymbol(item?.purchaseCurrency)}
							{formatNumber(item?.purchasePrice ?? 0)}
						</Button>
					</li>
				))}
			</ul>
			<PortalModal size="xl" opened={opened} onClose={close} title="Payment-IQ">
				<Box mih={500} id="cashier" />
			</PortalModal>
		</>
	);
};

export default PackagesCard;
