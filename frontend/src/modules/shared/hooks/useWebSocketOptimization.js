import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * WebSocket hook for PSO optimization with real-time updates
 * 
 * @param {Function} onUpdate - Callback for PSO iteration updates
 * @param {Function} onComplete - Callback when optimization completes
 * @param {Function} onError - Callback for errors
 * @returns {Object} WebSocket control functions and state
 */
export const useWebSocketOptimization = (onUpdate, onComplete, onError) => {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  // Get WebSocket URL from environment or default
  const getWebSocketUrl = () => {
    // Use backend server URL (port 8000), not frontend URL (port 5173)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendHost = import.meta.env.VITE_BASE_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'localhost:8000';
    return `${protocol}//${backendHost}/ws/optimize/plate-girder/`;
  };

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    const wsUrl = getWebSocketUrl();
    console.log('[WebSocket] Connecting to:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message.type, message.data);

          switch (message.type) {
            case 'task_started':
              console.log('[WebSocket] Task started:', message.data.task_id);
              setIsOptimizing(true);
              break;

            case 'pso_update':
              console.log('[WebSocket] PSO update - Iteration:', message.data.iteration, 'Particle:', message.data.particle_index);
              if (onUpdate) {
                onUpdate(message.data);
              }
              break;

            case 'pso_complete':
              console.log('[WebSocket] Optimization complete');
              setIsOptimizing(false);
              if (onComplete) {
                onComplete(message.data);
              }
              break;

            case 'pso_error':
              console.error('[WebSocket] Optimization error:', message.data.message);
              setIsOptimizing(false);
              if (onError) {
                onError(message.data.message);
              }
              break;

            case 'pso_heartbeat':
              console.log('[WebSocket] Heartbeat received');
              break;

            default:
              console.warn('[WebSocket] Unknown message type:', message.type);
          }
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Closed:', event.code, event.reason);
        setIsConnected(false);
        setIsOptimizing(false);

        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
      setIsConnected(false);
      if (onError) {
        onError('Failed to connect to optimization server');
      }
    }
  }, [onUpdate, onComplete, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      console.log('[WebSocket] Disconnecting...');
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsOptimizing(false);
  }, []);

  // Start optimization
  const startOptimization = useCallback((inputData) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Not connected. Connecting now...');
      connect();
      // Wait for connection and retry
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          startOptimization(inputData);
        } else {
          if (onError) {
            onError('Failed to connect to optimization server');
          }
        }
      }, 1000);
      return;
    }

    console.log('[WebSocket] Starting optimization with data:', inputData);
    
    try {
      wsRef.current.send(JSON.stringify({
        type: 'start_optimization',
        data: inputData
      }));
    } catch (err) {
      console.error('[WebSocket] Error sending message:', err);
      if (onError) {
        onError('Failed to start optimization');
      }
    }
  }, [connect, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    startOptimization,
    isConnected,
    isOptimizing,
  };
};
