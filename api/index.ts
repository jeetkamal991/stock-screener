import 'dotenv/config';
import { createApp } from '../server/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = createApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Pass the request to the Express app
  app(req, res);
}