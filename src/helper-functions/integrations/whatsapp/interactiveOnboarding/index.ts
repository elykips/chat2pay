import { start } from './states/start';
import { chooseMode } from './states/chooseMode';
import { chooseCapabilities } from './states/chooseCapabilities';
import { collectCountry } from './states/collectCountry';
import { confirm } from './states/confirm';

export const onboardingStates: Record<string, any> = {
  start,
  chooseMode,
  chooseCapabilities,
  collectCountry,
  confirm,
};
