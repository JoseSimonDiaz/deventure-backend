import Groq from 'groq-sdk';
import { config } from '../config.js';

export const aiClient = config.AI_API_KEY
  ? new Groq({ apiKey: config.AI_API_KEY, timeout: config.AI_TIMEOUT_MS, maxRetries: 0 })
  : null;
