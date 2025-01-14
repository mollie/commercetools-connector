import { getAccessToken } from "../commercetools/auth.commercetools";
import { updatePaymentExtension } from "../commercetools/extensions.commercetools";
import { logger } from "../utils/logger.utils";

export const updatePaymentExtensionAccessToken = async () => {
  logger.info('SCTM - job - starting updating access token process');
  
  const accessToken = await getAccessToken();
  await updatePaymentExtension(accessToken?.access_token as string);

  logger.info('SCTM - job - end process');
}