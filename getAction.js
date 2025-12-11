let latestAction = {
  action: null,
  url: null,
  count: null,
  value: null,
  timestamp: 0,
  processed: false,
  metadata: {}
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    try {
      const now = Date.now();
      const actionAge = now - latestAction.timestamp;
      const VALIDITY_WINDOW_MS = 60000; // 1 minute
      
      // Check for recent unprocessed action
      if (latestAction.action && actionAge < VALIDITY_WINDOW_MS && !latestAction.processed) {
        const responseData = {
          success: true,
          action: latestAction.action,
          url: latestAction.url,
          count: latestAction.count,
          value: latestAction.value,
          timestamp: latestAction.timestamp,
          metadata: latestAction.metadata,
          message: 'New action available'
        };
        
        // Mark as processed (except for volume adjustments)
        if (!['volume', 'sysvolume'].includes(latestAction.action)) {
          latestAction.processed = true;
        }
        
        return res.status(200).json(responseData);
      } else {
        return res.status(200).json({ 
          success: true,
          action: null,
          message: 'No pending action',
          timestamp: now,
          metadata: latestAction.metadata // Return current state (like input lock status)
        });
      }
    } catch (error) {
      console.error('[Server] Error in getAction:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
