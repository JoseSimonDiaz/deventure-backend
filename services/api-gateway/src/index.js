import { buildApp } from './app.js';
import { loadGatewayConfig } from './config.js';

const config = loadGatewayConfig();
buildApp(config).start(config.PORT);
