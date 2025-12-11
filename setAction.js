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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, action');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    try {
      // Get action from headers or body
      let action = req.headers['action'] || (req.body && req.body.action);
      
      if (!action) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing action parameter',
          received: req.body
        });
      }
      
      const { url, count, value } = req.body || {};
      
      // Store metadata for specific actions
      const metadata = {};
      if (action === 'lockInputs') {
        metadata.inputLocked = true;
        metadata.lockTime = Date.now();
      } else if (action === 'unlockInputs') {
        metadata.inputLocked = false;
      }
      
      latestAction = {
        action,
        url: url || null,
        count: count ? parseInt(count) : null,
        value: value || null,
        timestamp: Date.now(),
        processed: false,
        metadata
      };
      
      console.log(`[Server] Action stored: ${action}`, 
        url ? `(URL: ${url}, Count: ${count})` : '',
        value ? `(Value: ${value})` : '');
      
      return res.status(200).json({ 
        success: true,
        message: `Action "${action}" received`,
        action: latestAction.action,
        timestamp: latestAction.timestamp,
        metadata: latestAction.metadata
      });
      
    } catch (error) {
      console.error('[Server] Error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
