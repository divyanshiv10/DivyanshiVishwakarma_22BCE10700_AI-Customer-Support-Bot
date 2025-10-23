import { AlertTriangle, X } from 'lucide-react';

interface EscalationBannerProps {
  reason?: string;
  onDismiss?: () => void;
}

export function EscalationBanner({ reason, onDismiss }: EscalationBannerProps) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900">
            Your conversation has been escalated to our support team
          </p>
          {reason && (
            <p className="text-sm text-amber-700 mt-1">Reason: {reason}</p>
          )}
          <p className="text-xs text-amber-600 mt-2">
            A support representative will respond within 24 hours. You'll receive an email notification.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
