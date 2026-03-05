import React from "react";
import { motion } from "framer-motion";

/**
 * EmptyState - Reusable empty state display component
 * @param {React.ComponentType} icon - Icon component to display
 * @param {string} emoji - Emoji fallback if no icon
 * @param {string} title - Main title text
 * @param {string} message - Description message
 * @param {string} actionText - Button text
 * @param {string} actionHref - Link destination
 * @param {Function} actionOnClick - Click handler
 */
export default function EmptyState({
  icon: Icon,
  emoji,
  title,
  message,
  actionText,
  actionHref,
  actionOnClick,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10"
    >
      {Icon ? (
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 mb-6">
          <Icon size={40} className="text-gray-400 dark:text-gray-500" />
        </div>
      ) : emoji ? (
        <div className="text-8xl mb-6 opacity-20">{emoji}</div>
      ) : null}

      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
        {message}
      </p>

      {actionText && actionHref && (
        <a
          href={actionHref}
          className="inline-flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-400 transition-colors shadow-lg shadow-red-500/30"
        >
          {actionText}
        </a>
      )}

      {actionText && actionOnClick && (
        <button
          onClick={actionOnClick}
          className="inline-flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-400 transition-colors shadow-lg shadow-red-500/30"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
}