import { useState, useEffect, useCallback, useRef } from 'react';
import { PageAgent } from 'page-agent';
import { createAgent, getStoredConfig, saveStoredConfig, AgentConfig } from '@/services/pageAgent';

export function usePageAgent() {
  const [agent, setAgent] = useState<PageAgent | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const agentRef = useRef<PageAgent | null>(null);

  useEffect(() => {
    const config = getStoredConfig();
    if (config?.apiKey) {
      setIsConfigured(true);
      try {
        const newAgent = createAgent(config);
        agentRef.current = newAgent;
        setAgent(newAgent);
      } catch (err) {
        console.error('Failed to initialize agent:', err);
      }
    }
  }, []);

  const configure = useCallback((config: AgentConfig) => {
    try {
      saveStoredConfig(config);
      const newAgent = createAgent(config);
      agentRef.current = newAgent;
      setAgent(newAgent);
      setIsConfigured(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const execute = useCallback(async (instruction: string) => {
    if (!agentRef.current) {
      throw new Error('Agent not configured');
    }
    
    setIsExecuting(true);
    setError(null);
    
    try {
      await agentRef.current.execute(instruction);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const clearConfig = useCallback(() => {
    localStorage.removeItem('page_agent_config');
    agentRef.current = null;
    setAgent(null);
    setIsConfigured(false);
  }, []);

  return {
    agent,
    isConfigured,
    isExecuting,
    error,
    configure,
    execute,
    clearConfig,
  };
}