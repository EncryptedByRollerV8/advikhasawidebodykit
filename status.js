let latestAction = {
  action: null,
  timestamp: 0,
  processed: false,
  metadata: {}
};

let clientLastSeen = 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    const now = Date.now();
    const clientActive = (now - clientLastSeen) < 30000; // 30 seconds
    
    return res.status(200).json({
      server: 'online',
      clients: clientActive ? 1 : 0,
      lastAction: latestAction.action,
      lastActionTime: latestAction.timestamp,
      inputLocked: latestAction.metadata.inputLocked || false,
      uptime: process.uptime()
    });
  }
  
  if (req.method === 'POST') {
    // Clients can ping to show they're alive
    clientLastSeen = Date.now();
    return res.status(200).json({ success: true, timestamp: clientLastSeen });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
