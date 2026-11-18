import { register } from 'node:module';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';

register('@opentelemetry/instrumentation/hook.mjs', import.meta.url);

const NOISY_INSTRUMENTATIONS = {
  '@opentelemetry/instrumentation-fs': { enabled: false },
  '@opentelemetry/instrumentation-dns': { enabled: false },
  '@opentelemetry/instrumentation-net': { enabled: false },
};

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations(NOISY_INSTRUMENTATIONS)],
});

sdk.start();

process.once('SIGTERM', () => sdk.shutdown());
