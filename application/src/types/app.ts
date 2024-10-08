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
  name?: Record<string, string>;
  description: Record<string, string>;
  imageUrl: string;
  status: string;
  displayOrder?: number;
};

export type MollieResult = {
  _embedded: {
    methods: MollieMethod[];
  };
};
