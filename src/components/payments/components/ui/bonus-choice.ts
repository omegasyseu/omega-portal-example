// The amount to check bonus plans for, or nothing while the amount can't be deposited:
// none yet, not above zero, or over the method's daily limit (the deposit form refuses
// it too). An unknown limit doesn't block the check.
export const amountToCheck = (amount: string, dailyLimit?: number | string) => {
	const value = Number(amount);
	if (amount === "" || !(value > 0)) {
		return undefined;
	}
	return value > Number(dailyLimit) ? undefined : amount;
};

// The plan to claim: the picked one while the amount is still eligible for it, so a
// new amount keeps the pick when it qualifies too, otherwise none ("").
export const pickedPlanId = (
	selectedId: string,
	plans?: readonly { bonusPlanId: string }[],
) =>
	plans?.some(({ bonusPlanId }) => bonusPlanId === selectedId)
		? selectedId
		: "";
