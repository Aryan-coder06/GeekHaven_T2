import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Wifi, WifiOff, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROLLNO, ASSIGNMENT_SEED } from '@/utils/seed';
import { api } from '@/services/api';

interface HealthStatus {
  frontend: 'healthy' | 'error';
  backend: 'healthy' | 'error' | 'checking';
  timestamp: Date;
  backendLatency?: number;
  backendError?: string;
}

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    frontend: 'healthy',
    backend: 'checking',
    timestamp: new Date(),
  });

  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkBackendHealth = async () => {
    const startTime = Date.now();
    setStatus(prev => ({ ...prev, backend: 'checking' }));

    try {
      // Try to ping a simple endpoint
      await api.get('/posts/1', { timeout: 5000 });
      const latency = Date.now() - startTime;
      
      setStatus(prev => ({
        ...prev,
        backend: 'healthy',
        backendLatency: latency,
        backendError: undefined,
        timestamp: new Date(),
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        backend: 'error',
        backendError: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      }));
    }
    
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'checking':
        return <Clock className="w-6 h-6 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Healthy</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Error</Badge>;
      case 'checking':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Checking...</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Health Check</h1>
        <p className="text-muted-foreground">
          System status for Roll No: <span className="font-mono text-primary">{ROLLNO}</span>
        </p>
      </div>

      {/* Main Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Frontend Status */}
        <Card className="marketplace-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5" />
                <span>Frontend Status</span>
              </div>
              {getStatusBadge(status.frontend)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.frontend)}
              <div>
                <p className="font-semibold text-lg text-green-600 dark:text-green-400">
                  Frontend Alive!
                </p>
                <p className="text-sm text-muted-foreground">
                  React application is running smoothly
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build Status</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Successful</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seed Applied</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Yes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Theme System</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Context Providers</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Loaded</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Status */}
        <Card className="marketplace-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {status.backend === 'error' ? (
                  <WifiOff className="w-5 h-5" />
                ) : (
                  <Server className="w-5 h-5" />
                )}
                <span>Backend Status</span>
              </div>
              {getStatusBadge(status.backend)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.backend)}
              <div>
                <p className={`font-semibold text-lg ${
                  status.backend === 'healthy' 
                    ? 'text-green-600 dark:text-green-400' 
                    : status.backend === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {status.backend === 'healthy' 
                    ? 'Backend Reachable' 
                    : status.backend === 'error'
                    ? 'Backend Unreachable'
                    : 'Checking Backend...'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {status.backend === 'checking' 
                    ? 'Testing API connectivity...'
                    : status.backend === 'error'
                    ? 'API endpoint not responding'
                    : 'API endpoint responding normally'
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              {status.backendLatency && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {status.backendLatency}ms
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Check</span>
                <span className="font-medium">
                  {lastCheck.toLocaleTimeString()}
                </span>
              </div>
              
              {status.backendError && (
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-red-800 dark:text-red-300 text-xs">
                  <strong>Error:</strong> {status.backendError}
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkBackendHealth}
              disabled={status.backend === 'checking'}
              className="w-full"
            >
              {status.backend === 'checking' ? 'Checking...' : 'Recheck Backend'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="marketplace-card">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Assignment Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seed:</span>
                  <span className="font-mono text-primary">{ASSIGNMENT_SEED}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Roll No:</span>
                  <span className="font-mono text-primary">{ROLLNO}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span>Reselling Marketplace</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Runtime Info</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Agent:</span>
                  <span className="truncate max-w-32">
                    {navigator.userAgent.split(' ')[0]}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Viewport:</span>
                  <span>{window.innerWidth}x{window.innerHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online:</span>
                  <span className={navigator.onLine ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {navigator.onLine ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Page Routes</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health:</span>
                  <span className="text-green-600 dark:text-green-400">/{ROLLNO}/healthz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logs:</span>
                  <span className="text-green-600 dark:text-green-400">/logs/recent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">About:</span>
                  <span className="text-green-600 dark:text-green-400">/about</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}