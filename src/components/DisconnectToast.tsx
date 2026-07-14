import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { vaultEase } from '../lib/motion'

export function DisconnectToast({
  show,
  onDismiss,
}: {
  show: boolean
  onDismiss: () => void
}) {
  useEffect(() => {
    if (!show) return
    const t = window.setTimeout(onDismiss, 4000)
    return () => window.clearTimeout(t)
  }, [show, onDismiss])

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-x-0 top-16 z-[90] flex justify-center px-4"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: vaultEase }}
        >
          <div className="surface-filled max-w-md px-4 py-3 text-sm text-[var(--text-secondary)] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            Agent wallet disconnected. Connect again to return to the dashboard.
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
