import React from 'react';
import { Trash2, Clock, Tag, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLog } from '@/contexts/LogContext';
import { formatDistanceToNow } from 'date-fns';

export default function LogsRecent() {
  const { logs, clearLogs } = useLog();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'click':
        return '🖱️';
      case 'search':
        return '🔍';
      case 'cart':
        return '🛒';
      case 'navigation':
        return '🧭';
      case 'api':
        return '📡';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'click':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'search':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'cart':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'navigation':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'api':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recent Frontend Logs</h1>
          <p className="text-muted-foreground mt-2">
            Last 20 frontend actions tracked in real-time
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={clearLogs}
          disabled={logs.length === 0}
          className="flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Logs</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="marketplace-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold text-primary">{logs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {['click', 'search', 'cart', 'api'].map((type) => {
          const count = logs.filter(log => log.type === type).length;
          return (
            <Card key={type} className="marketplace-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground capitalize">{type} Actions</p>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                  </div>
                  <span className="text-2xl">{getTypeIcon(type)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <Card className="marketplace-card">
          <CardContent className="p-12 text-center">
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No logs yet</h3>
            <p className="text-muted-foreground">
              Start interacting with the application to see logs appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="marketplace-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Action Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {logs.map((log, index) => (
                <div 
                  key={log.id}
                  className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-smooth ${
                    index === 0 ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-xl">{getTypeIcon(log.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-foreground">{log.action}</h4>
                          <Badge className={`text-xs ${getTypeColor(log.type)}`}>
                            {log.type}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="default" className="text-xs animate-pulse">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground break-words">
                          {log.details}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Developer Info */}
      <Card className="marketplace-card mt-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">About Logging</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              This page shows the last 20 frontend actions captured by our logging system.
              Actions are tracked in local state and include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Clicks:</strong> Button clicks, navigation links</li>
              <li><strong>Searches:</strong> Product searches and filters</li>
              <li><strong>Cart:</strong> Add/remove/update cart actions</li>
              <li><strong>Navigation:</strong> Page navigation events</li>
              <li><strong>API:</strong> Backend API interactions</li>
              <li><strong>Errors:</strong> Frontend error events</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}