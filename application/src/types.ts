import type { TChannelRole } from './types/generated/ctp';
import { type TCurrencyCode } from '@commercetools-uikit/money-input';

export type TFormValues = {
  key: string;
  name: Record<string, string>;
  roles: TChannelRole[];
};

export type TSyncAction = { action: string; [x: string]: unknown };

export type TGraphqlUpdateAction = Record<string, Record<string, unknown>>;

export type TChangeNameActionPayload = {
  name: Record<string, string>;
};

export type TMethodObjectFormValues = {
  id: string;
  container: string;
  key: string;
  value: string;
};

export type TMethodObjectValueFormValues = {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  imageUrl: string;
  status: string;
  displayOrder: number;
  pricingConstraints?: TPricingConstraintItem[];
};

export type TAvailabilityObjectValueFormValues = {
  id?: string;
  countryCode: string;
  currencyCode: string;
  minAmount: number;
  maxAmount: number;
};

export type TAvailabilityAmount = {
  minAmount: string;
  maxAmount?: string;
};

export type TAmountPerCurrency = {
  [key in TCurrencyCode as string]: TAvailabilityAmount;
};

export type TAmountPerCountry = {
  [key: string]: TAmountPerCurrency;
};

export type TPricingConstraintItem = {
  id?: number; // Row ID
  countryCode: string;
  currencyCode: string;
  minAmount: number;
  maxAmount?: number;
  surchargeCost?: string;
};

export type TPricingConstraintIdentifier = {
  countryCode: string;
  currencyCode: TCurrencyCode;
};
