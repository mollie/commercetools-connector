import { lazy } from 'react';

const MethodDetails = lazy(
    () => import('./method-details' /* webpackChunkName: "method-details" */)
);

export default MethodDetails;
