export type OnboardingState =
  | 'start'
  | 'chooseMode'
  | 'chooseCapabilities'
  | 'collectCountry'
  | 'confirm'
  | 'completed';

export type OnboardingPayload = {
  mode?: 'shared' | 'dedicated';
  name?: string;
  country?: string;
  capabilities?: string[];
  mpesa?: {
    business_shortcode: string;
    passkey_secret_ref: string;
  };
  db?: {
    db_name?: string;
  };
};

export type StateArgs = {
  message: any;
  payload: OnboardingPayload;
  phone: string;
};

export type StateResult = {
  reply: any; // string OR WhatsApp interactive object
  nextState: OnboardingState;
  payloadPatch?: Partial<OnboardingPayload>;
  ready?: boolean;
  vendorPayload?: any;
};

export type StateHandler = (args: StateArgs) => Promise<StateResult>;
