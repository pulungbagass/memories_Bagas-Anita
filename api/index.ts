import type { Request, Response } from 'express';
import app from '../server';

// Export the Express app as the Vercel Serverless Function entry point
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
