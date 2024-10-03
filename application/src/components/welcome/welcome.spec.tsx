import {
  screen,
  mapResourceAccessToAppliedPermissions,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { renderApplicationWithRedux } from '../../test-utils';
import { entryPointUriPath, PERMISSIONS } from '../../constants';
import ApplicationRoutes from '../../routes';
import { setupServer } from 'msw/node';
import { graphql, GraphQLHandler, rest, RestHandler } from 'msw';
import * as CustomObject from '@commercetools-test-data/custom-object';
import { buildGraphqlList } from '@commercetools-test-data/core';
import { TCustomObject } from '@commercetools-test-data/custom-object';
import messages from './messages';

const mockServer = setupServer();
afterEach(() => mockServer.resetHandlers());
beforeAll(() =>
  mockServer.listen({
    onUnhandledRequest: 'error',
  })
);
afterAll(() => {
  mockServer.close();
});

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route = options.route || `/shopm-adv-dev/${entryPointUriPath}`;
  const { history } = renderApplicationWithRedux(<ApplicationRoutes />, {
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions([
        PERMISSIONS.View,
        PERMISSIONS.Manage,
      ]),
    },
    ...options,
  });

  return { history };
};

const fetchExtensionDestinationQueryHandler = graphql.query(
  'FetchExtensionDestination',
  (_req, res, ctx) => {
    return res(
      ctx.data({
        extension: {
          destination: {
            type: 'HttpDestination',
            url: 'https://mc-app-1254155.euope-west1.gcp.commercetoolsr.app',
          },
        },
      })
    );
  }
);

const forwardRequestHandler = rest.get('/forward-to', (_req, res, ctx) => {
  return res(
    ctx.json({
      _embedded: {
        methods: [
          {
            resource: 'method',
            id: 'applepay',
            description: 'Apple Pay',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '10000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/applepay.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/applepay%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/applepay.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'American Express (intra-EEA)',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '2.9',
                feeRegion: 'amex-intra-eea',
              },
              {
                description: 'Commercial & non-European cards',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '3.25',
                feeRegion: 'other',
              },
              {
                description: 'Domestic consumer cards',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.8',
                feeRegion: 'domestic',
              },
              {
                description: 'European commercial cards',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '2.9',
                feeRegion: 'intra-eu-corporate',
              },
              {
                description: 'European consumer cards',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.8',
                feeRegion: 'eu-cards',
              },
              {
                description: 'Pre-authorization fees',
                fixed: {
                  value: '0.00',
                  currency: 'EUR',
                },
                variable: '0.12',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/applepay',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'ideal',
            description: 'iDEAL',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '50000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/ideal.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/ideal%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/ideal.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Netherlands',
                fixed: {
                  value: '0.39',
                  currency: 'EUR',
                },
                variable: '0',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/ideal',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'creditcard',
            description: 'Card',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '10000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/creditcard.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/creditcard%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/creditcard.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'American Express (intra-EEA)',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '2.9',
                feeRegion: 'amex-intra-eea',
              },
              {
                description: 'Commercial & non-European cards',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '3.25',
                feeRegion: 'other',
              },
              {
                description: 'Domestic consumer cards',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.8',
                feeRegion: 'domestic',
              },
              {
                description: 'European commercial cards',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '2.9',
                feeRegion: 'intra-eu-corporate',
              },
              {
                description: 'European consumer cards',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.8',
                feeRegion: 'eu-cards',
              },
              {
                description: 'Pre-authorization fees',
                fixed: {
                  value: '0.00',
                  currency: 'EUR',
                },
                variable: '0.12',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/creditcard',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'in3',
            description: 'iDEAL Pay in 3 instalments, 0% interest',
            minimumAmount: {
              value: '0.00',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '30000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/in3.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/in3%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/in3.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Netherlands',
                fixed: {
                  value: '0.95',
                  currency: 'EUR',
                },
                variable: '3.99',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/in3',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'klarnapaylater',
            description: 'Pay later.',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '4000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/klarnapaylater.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/klarnapaylater%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/klarnapaylater.svg',
            },
            status: null,
            pricing: [
              {
                description: 'Austria',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Denmark',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Finland',
                fixed: {
                  value: '0.59',
                  currency: 'EUR',
                },
                variable: '2.79',
              },
              {
                description: 'France',
                fixed: {
                  value: '0.20',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Germany',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Italy',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
              {
                description: 'Netherlands & Belgium',
                fixed: {
                  value: '1.00',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Norway',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Portugal',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
              {
                description: 'Spain',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
              {
                description: 'Sweden',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/klarnapaylater',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'klarnapaynow',
            description: 'Pay now.',
            minimumAmount: {
              value: '0.10',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '10000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/klarnapaynow.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/klarnapaynow%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/klarnapaynow.svg',
            },
            status: null,
            pricing: [
              {
                description: 'Austria',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.45',
              },
              {
                description: 'Belgium',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.45',
              },
              {
                description: 'Finland',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.45',
              },
              {
                description: 'Germany',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.45',
              },
              {
                description: 'Netherlands',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.45',
              },
              {
                description: 'Sweden',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/klarnapaynow',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'klarnasliceit',
            description: 'Slice it.',
            minimumAmount: {
              value: '45.00',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '5000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/klarnasliceit.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/klarnasliceit%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/klarnasliceit.svg',
            },
            status: null,
            pricing: [
              {
                description: 'Austria',
                fixed: {
                  value: '0.00',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Denmark',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Finland',
                fixed: {
                  value: '0.59',
                  currency: 'EUR',
                },
                variable: '0.99',
              },
              {
                description: 'Germany',
                fixed: {
                  value: '0.00',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Netherlands',
                fixed: {
                  value: '0.95',
                  currency: 'EUR',
                },
                variable: '3.99',
              },
              {
                description: 'Norway',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Sweden',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/klarnasliceit',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'paypal',
            description: 'PayPal',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: null,
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/paypal.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/paypal%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/paypal.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Worldwide',
                fixed: {
                  value: '0.10',
                  currency: 'EUR',
                },
                variable: '0',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/paypal',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'banktransfer',
            description: 'Bank transfer',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '1000000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/banktransfer.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/banktransfer%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/banktransfer.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Europe',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '0',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/banktransfer',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'giftcard',
            description: 'Gift cards',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: null,
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/giftcard.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/giftcard%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/giftcard.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Netherlands',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '0',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/giftcard',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'bancontact',
            description: 'Bancontact',
            minimumAmount: {
              value: '0.02',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '50000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/bancontact.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/bancontact%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/bancontact.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Belgium',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.4',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/bancontact',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'eps',
            description: 'eps',
            minimumAmount: {
              value: '1.00',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '50000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/eps.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/eps%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/eps.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Austria',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.5',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/eps',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'przelewy24',
            description: 'Przelewy24',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '12815.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/przelewy24.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/przelewy24%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/przelewy24.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Poland',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '2.2',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/przelewy24',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'kbc',
            description: 'KBC/CBC Payment Button',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '50000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/kbc.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/kbc%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/kbc.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Belgium',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '0.9',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/kbc',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'belfius',
            description: 'Belfius Pay Button',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '50000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/belfius.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/belfius%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/belfius.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Belgium',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '0.9',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/belfius',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'voucher',
            description: 'Vouchers',
            minimumAmount: {
              value: '1.00',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '100000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/voucher.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/voucher%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/voucher.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Belgium & France',
                fixed: {
                  value: '0.50',
                  currency: 'EUR',
                },
                variable: '0.5',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/voucher',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'directdebit',
            description: 'SEPA Direct Debit',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '1000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/directdebit.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/directdebit%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/directdebit.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Batch',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '0',
              },
              {
                description: 'Europe',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '0.9',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/directdebit',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'billie',
            description: 'Pay by Invoice for Businesses - Billie',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '25000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/billie.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/billie%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/billie.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Austria',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '3.49',
              },
              {
                description: 'France',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '3.49',
              },
              {
                description: 'Germany',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '3.49',
              },
              {
                description: 'Netherlands',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '3.49',
              },
              {
                description: 'Sweden',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '3.49',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/billie',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'klarna',
            description: 'Pay with Klarna',
            minimumAmount: {
              value: '1.00',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '14000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/klarna.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/klarna%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/klarna.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Austria – Financing',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Austria – Pay Later',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Austria – Pay Now',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Denmark – Financing',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Denmark – Pay Later',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Denmark – Pay Now',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Finland – Financing',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Finland – Pay Later',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Finland – Pay Now',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Germany – Financing',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Germany – Pay Later',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Germany – Pay Now',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Ireland – Financing',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
              {
                description: 'Ireland – Pay Later',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
              {
                description: 'Ireland – Pay Now',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
              {
                description: 'Netherlands – Financing',
                fixed: {
                  value: '0.45',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Netherlands – Pay Later',
                fixed: {
                  value: '0.45',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Netherlands – Pay Now',
                fixed: {
                  value: '0.45',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Norway – Financing',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Norway – Pay Later',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Norway – Pay Now',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Sweden – Financing',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Sweden – Pay Later',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Sweden – Pay Now',
                fixed: {
                  value: '0.40',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Switzerland – Financing',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Switzerland – Pay Later',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Switzerland – Pay Now',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'United Kingdom – Financing',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
              {
                description: 'United Kingdom – Pay Later',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
              {
                description: 'United Kingdom – Pay Now',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '4.99',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/klarna',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'twint',
            description: 'TWINT',
            minimumAmount: {
              value: '0.01',
              currency: 'CHF',
            },
            maximumAmount: {
              value: '5000.00',
              currency: 'CHF',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/twint.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/twint%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/twint.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Switzerland',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '2.3',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/twint',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'blik',
            description: 'Blik',
            minimumAmount: {
              value: '0.01',
              currency: 'PLN',
            },
            maximumAmount: {
              value: '50000.00',
              currency: 'PLN',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/blik.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/blik%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/blik.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Poland',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.6',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/blik',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'bancomatpay',
            description: 'Bancomat Pay',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '1000000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/bancomatpay.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/bancomatpay%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/bancomatpay.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'Italy',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.5',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/bancomatpay',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'riverty',
            description: 'Riverty',
            minimumAmount: {
              value: '5.00',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '1500.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/riverty.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/riverty%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/riverty.svg',
            },
            status: null,
            pricing: [
              {
                description: 'Austria',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Belgium',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Germany',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
              {
                description: 'Netherlands',
                fixed: {
                  value: '0.35',
                  currency: 'EUR',
                },
                variable: '2.99',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/riverty',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'satispay',
            description: 'Satispay',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '99999.99',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/satispay.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/satispay%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/satispay.svg',
            },
            status: null,
            pricing: [
              {
                description: 'EUR',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '1.5',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/satispay',
                type: 'application/hal+json',
              },
            },
          },
          {
            resource: 'method',
            id: 'trustly',
            description: 'Trustly',
            minimumAmount: {
              value: '0.01',
              currency: 'EUR',
            },
            maximumAmount: {
              value: '50000.00',
              currency: 'EUR',
            },
            image: {
              size1x:
                'https://www.mollie.com/external/icons/payment-methods/trustly.png',
              size2x:
                'https://www.mollie.com/external/icons/payment-methods/trustly%402x.png',
              svg: 'https://www.mollie.com/external/icons/payment-methods/trustly.svg',
            },
            status: 'activated',
            pricing: [
              {
                description: 'EUR',
                fixed: {
                  value: '0.25',
                  currency: 'EUR',
                },
                variable: '0.9',
              },
            ],
            _links: {
              self: {
                href: 'https://api.mollie.com/v2/methods/trustly',
                type: 'application/hal+json',
              },
            },
          },
        ],
      },
      count: 25,
      _links: {
        documentation: {
          href: 'https://docs.mollie.com/reference/v2/methods-api/list-all-methods',
          type: 'text/html',
        },
        self: {
          href: 'https://api.mollie.com/v2/methods/all?locale=en_US&include=pricing',
          type: 'application/hal+json',
        },
      },
    })
  );
});

const useMockServerHandlers = (handlers: (GraphQLHandler | RestHandler)[]) => {
  mockServer.use(
    graphql.query('FetchCustomObjects', (_req, res, ctx) => {
      const totalItems = 1;
      return res(
        ctx.data({
          customObjects: buildGraphqlList<TCustomObject>(
            Array.from({ length: totalItems }).map((_, index) =>
              CustomObject.random()
                .id(`id-${index}`)
                .key('paypal')
                .container('sctm-app-methods')
                .value({
                  id: 'paypal',
                  status: 'Active',
                  displayOrder: 0,
                  image: 'image',
                })
            ),
            {
              name: 'CustomObject',
              total: totalItems,
            }
          ),
        })
      );
    }),
    ...handlers
  );
};

describe('Test welcome.tsx', () => {
  it('should render welcome page', async () => {
    useMockServerHandlers([
      fetchExtensionDestinationQueryHandler,
      forwardRequestHandler,
    ]);

    renderApp();
    await screen.findByText(messages.title.defaultMessage);
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});
