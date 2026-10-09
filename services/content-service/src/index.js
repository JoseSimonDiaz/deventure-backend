import { buildApp } from './app.js';
import { config } from './config.js';

buildApp().start(config.PORT);
