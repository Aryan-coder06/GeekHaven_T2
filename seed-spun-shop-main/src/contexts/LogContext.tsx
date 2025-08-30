import React, { createContext, useContext, useReducer } from 'react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  type: 'click' | 'search' | 'cart' | 'navigation' | 'api' | 'error';
}

interface LogState {
  logs: LogEntry[];
}

type LogAction =
  | { type: 'ADD_LOG'; log: Omit<LogEntry, 'id' | 'timestamp'> }
  | { type: 'CLEAR_LOGS' };

const initialState: LogState = {
  logs: [],
};

function logReducer(state: LogState, action: LogAction): LogState {
  switch (action.type) {
    case 'ADD_LOG':
      const newLog: LogEntry = {
        ...action.log,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      
      // Keep only the last 20 logs
      const updatedLogs = [newLog, ...state.logs].slice(0, 20);
      
      return {
        logs: updatedLogs,
      };

    case 'CLEAR_LOGS':
      return {
        logs: [],
      };

    default:
      return state;
  }
}

interface LogContextType extends LogState {
  addLog: (action: string, details: string, type: LogEntry['type']) => void;
  clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(logReducer, initialState);

  const addLog = (action: string, details: string, type: LogEntry['type']) => {
    dispatch({
      type: 'ADD_LOG',
      log: { action, details, type },
    });
  };

  const clearLogs = () => {
    dispatch({ type: 'CLEAR_LOGS' });
  };

  return (
    <LogContext.Provider
      value={{
        ...state,
        addLog,
        clearLogs,
      }}
    >
      {children}
    </LogContext.Provider>
  );
}

export function useLog() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
}
