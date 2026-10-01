import type { NextApiRequest, NextApiResponse } from 'next'
import { getHondurasTimestamp } from '../../lib/timezone'

export default function healthHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  return res.status(200).json({
    status: 'healthy',
    timestamp: getHondurasTimestamp(),
    uptime: process.uptime(),
  })
}
