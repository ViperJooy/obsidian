import { useTranslation } from 'react-i18next';
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText: customConfirmText,
  cancelText: customCancelText,
  variant = "danger"
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const cancelText = customCancelText || t("modal.cancel");
  const confirmText = customConfirmText || t("settings.confirm");
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-4 bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <X size={16} className="text-text-tertiary" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  variant === 'danger' ? 'bg-rose-500/20 text-rose-400' : 'bg-accent-primary/20 text-accent-primary'
                }`}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="text-sm text-text-tertiary">{message}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-on-surface font-medium text-sm transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                    variant === 'danger'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-accent-primary hover:bg-accent-primary/90 text-white'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
