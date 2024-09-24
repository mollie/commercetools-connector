import { useEffect, useState, type ReactNode } from 'react';
import { useRouteMatch, Link as RouterLink } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import { AngleRightIcon } from '@commercetools-uikit/icons';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import styles from './welcome.module.css';
import WebDeveloperSvg from './web-developer.svg';
import {
  PageContentFull,
  PageContentNarrow,
} from '@commercetools-frontend/application-components';
import { useDataTableSortingState } from '@commercetools-uikit/hooks';

type TWrapWithProps = {
  children: ReactNode;
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
};
const WrapWith = (props: TWrapWithProps) => (
  <>{props.condition ? props.wrapper(props.children) : props.children}</>
);
WrapWith.displayName = 'WrapWith';

type TInfoCardProps = {
  title: string;
  content: string;
  linkTo: string;
  isExternal?: boolean;
};

const Welcome = () => {
  const match = useRouteMatch();
  const intl = useIntl();
  let methods;

  useEffect(() => {
    fetch('https://api.mollie.com/v2/methods/all', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer test_TquMT7yDtvstNCk8xegEyE8z3A9Tuh`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('response data', data);
        methods = data;
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <Spacings.Stack scale="xl">
        <PageContentFull>
          <Spacings.Stack scale="xl">
            <Text.Headline as="h1" intlMessage={messages.title} />
            <div>
              <div className={styles.imageContainer}>
                <img
                  alt="web developer"
                  src={WebDeveloperSvg}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </Spacings.Stack>
        </PageContentFull>

        <PageContentNarrow>
          <Spacings.Stack scale="xl">
            <div>
              <Text.Body>{intl.formatMessage(messages.subtitle)}</Text.Body>
            </div>
            <div>{intl.formatMessage(messages.notice)}</div>
          </Spacings.Stack>
        </PageContentNarrow>
      </Spacings.Stack>
    </>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
