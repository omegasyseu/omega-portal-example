import { StarterContentError } from './seed-files.ts';

/** A brand as IPS lists it, in the Brand's own fields. */
export type IpsBrand = { brandId: number; name: string };

/**
 * The brands in IPS's `/getBrands` response. IPS answers 200 even when a call fails, so
 * only a `SUCCESS` status with brands in it is accepted.
 */
export const brandsFromIps = (body: unknown): IpsBrand[] => {
  const { status, message, brands } = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  if (status !== 'SUCCESS') {
    throw new StarterContentError(`IPS /getBrands did not succeed: ${status} ${message ?? ''}`.trim());
  }
  if (!Array.isArray(brands) || brands.length === 0) {
    throw new StarterContentError('IPS lists no brands.');
  }
  return brands.map((brand: unknown) => {
    const { id, name } = (typeof brand === 'object' && brand !== null ? brand : {}) as Record<string, unknown>;
    if (typeof id !== 'number' || !Number.isInteger(id) || typeof name !== 'string' || name === '') {
      throw new StarterContentError(`IPS brand ${JSON.stringify(brand)} has no whole-number id or no name.`);
    }
    return { brandId: id, name };
  });
};

/** Every brand IPS at `ipsUrl` lists. Any failure is a StarterContentError. */
export const fetchIpsBrands = async (ipsUrl: string): Promise<IpsBrand[]> => {
  let response: Response;
  try {
    response = await fetch(`${ipsUrl}/getBrands`, { headers: { Accept: 'application/json' } });
  } catch (error) {
    throw new StarterContentError(`IPS ${ipsUrl}/getBrands can't be reached: ${(error as Error).message}`);
  }
  if (!response.ok) {
    throw new StarterContentError(`IPS ${ipsUrl}/getBrands answered ${`${response.status} ${response.statusText}`.trim()}.`);
  }
  const body = await response.json().catch(() => {
    throw new StarterContentError(`IPS ${ipsUrl}/getBrands did not answer with JSON.`);
  });
  return brandsFromIps(body);
};
