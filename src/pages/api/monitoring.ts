// api/monitoring/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Helper to read the raw body as a string
async function getRawBody(req: NextApiRequest): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const envelope = await getRawBody(req);

    if (!envelope) {
      return res.status(400).json({
        error: "Error can't be tunneled because the body is empty.",
      });
    }

    const piece = envelope.split('\n')[0];
    const header = JSON.parse(piece);

    const dsn = new URL(header.dsn);
    if (dsn.hostname !== process.env.SENTRY_HOST) {
      return res.status(400).json({
        error: `Invalid Sentry host: ${dsn.hostname}`,
      });
    }

    const project_id = dsn.pathname.substring(1);
    if (project_id !== process.env.SENTRY_PROJECT_ID) {
      return res.status(400).json({
        error: `Invalid Project ID: ${project_id}`,
      });
    }

    const url = `https://${process.env.SENTRY_HOST}/api/${project_id}/envelope/`;
    await fetch(url, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    return res.status(200).json({ message: 'Error sent.' });
  } catch (e: any) {
    return res.status(500).json({
      error: 'Could not tunnel Sentry error correctly.',
      data: e.message,
    });
  }
}

// Disable Next.js body parsing so we can handle the raw body ourselves
export const config = {
  api: {
    bodyParser: false,
  },
};
  
  