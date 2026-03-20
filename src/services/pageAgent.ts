import { PageAgent, SupportedLanguage } from 'page-agent';

export interface AgentConfig {
  model: string;
  baseURL: string;
  apiKey: string;
  language?: SupportedLanguage;
}

const DEFAULT_CONFIG: AgentConfig = {
  model: 'qwen3.5-plus',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: '',
  language: 'zh-CN' as SupportedLanguage,
};

export function createAgent(config: Partial<AgentConfig> = {}): PageAgent {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!finalConfig.apiKey) {
    throw new Error('API Key is required to initialize PageAgent');
  }

  return new PageAgent({
    model: finalConfig.model,
    baseURL: finalConfig.baseURL,
    apiKey: finalConfig.apiKey,
    language: finalConfig.language,
  });
}

export function getStoredConfig(): AgentConfig | null {
  const stored = localStorage.getItem('page_agent_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveStoredConfig(config: AgentConfig): void {
  localStorage.setItem('page_agent_config', JSON.stringify(config));
}

export function clearStoredConfig(): void {
  localStorage.removeItem('page_agent_config');
}