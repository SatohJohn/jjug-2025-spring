import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { OpenFeature, OpenFeatureProvider } from '@openfeature/react-sdk';
import DevCycleReactProvider from '@devcycle/openfeature-react-provider'
import { FlagdWebProvider } from '@openfeature/flagd-web-provider'

const flag = import.meta.env.VITE_FEATURE_PROVIDER
if (flag) {
  await OpenFeature.setContext({ user_id: 'user_id' })
  await OpenFeature.setProviderAndWait(new DevCycleReactProvider(import.meta.env.VITE_DEVCYCLE_CLIENT_SDK_KEY));
} else {
  OpenFeature.setProvider(new FlagdWebProvider({
    host: 'localhost',
    port: 8013,
    tls: false,
    maxRetries: 10,
    maxDelay: 3000,
  }));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OpenFeatureProvider>
      <App />
    </OpenFeatureProvider>
  </React.StrictMode>
);
