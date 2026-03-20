import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Settings, Loader2 } from 'lucide-react';
import { usePageAgent } from '@/hooks/usePageAgent';
import { AgentConfig } from '@/services/pageAgent';
import { useTranslation } from "react-i18next";

export default function AIAgent() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [instruction, setInstruction] = useState('');
  const { isConfigured, isExecuting, error, configure, execute, clearConfig } = usePageAgent();

  const [config, setConfig] = useState<AgentConfig>({
    model: 'qwen3.5-plus',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: '',
    language: 'zh-CN',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    try {
      await execute(instruction);
      setInstruction('');
    } catch (err) {
      console.error('Execution failed:', err);
    }
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.apiKey.trim()) return;

    try {
      configure(config);
      setShowSettings(false);
    } catch (err) {
      console.error('Configuration failed:', err);
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-dim rounded-full shadow-lg flex items-center justify-center text-on-primary-fixed z-50 hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <Bot size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-primary" />
                <span className="font-semibold text-on-surface">{t('ai.agent')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-lg hover:bg-surface-variant/50 text-on-surface-variant transition-colors"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-variant/50 text-on-surface-variant transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {showSettings ? (
                <form onSubmit={handleConfigSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      {t('ai.model')}
                    </label>
                    <input
                      type="text"
                      value={config.model}
                      onChange={(e) => setConfig({ ...config, model: e.target.value })}
                      className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="qwen3.5-plus"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Base URL
                    </label>
                    <input
                      type="text"
                      value={config.baseURL}
                      onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
                      className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="sk-..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-on-primary-fixed font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {t('ai.save_config')}
                    </button>
                    {isConfigured && (
                      <button
                        type="button"
                        onClick={clearConfig}
                        className="px-4 py-2 bg-destructive/20 text-destructive font-semibold rounded-lg hover:bg-destructive/30 transition-colors"
                      >
                        {t('ai.clear')}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <>
                  {!isConfigured ? (
                    <div className="text-center py-8">
                      <Bot size={48} className="mx-auto text-outline-variant mb-4" />
                      <p className="text-on-surface-variant text-sm mb-4">
                        {t('ai.need_config')}
                      </p>
                      <button
                        onClick={() => setShowSettings(true)}
                        className="bg-primary text-on-primary-fixed font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {t('ai.config_btn')}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <p className="text-on-surface-variant text-xs">
                        {t('ai.hint')}
                      </p>
                      <textarea
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                        rows={3}
                        placeholder={t("ai.placeholder")}
                        disabled={isExecuting}
                      />
                      {error && (
                        <p className="text-destructive text-xs">{error}</p>
                      )}
                      <button
                        type="submit"
                        disabled={isExecuting || !instruction.trim()}
                        className="w-full bg-primary text-on-primary-fixed font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isExecuting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            {t('ai.executing')}
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            {t('ai.execute')}
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}