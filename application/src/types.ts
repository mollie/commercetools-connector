import type { TChannelRole } from './types/generated/ctp';

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
};
