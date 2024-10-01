export type MollieMethod = {
  resource: string;
  description: string;
  id: string;
  image: {
    svg: string;
    size1x: string;
    size2x: string;
  };
  maximumAmount: {
    value: string;
    currency: string;
  };
  minimumAmount: {
    value: string;
    currency: string;
  };
  pricing: {
    value: string;
    currency: string;
  }[];
  status: string;
  _links: {
    self: {
      href: string;
      type: string;
    };
  };
};

export type CustomMethodObject = {
  id: string;
  description: string;
  imageUrl: string;
  active: boolean;
  displayOrder?: number;
};
