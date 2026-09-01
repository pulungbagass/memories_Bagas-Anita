import React, { useState } from "react";
import {
  Bug,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { DebugErrorLog } from "../../lib/vercelClient";

interface DiagnosticInspectorProps {
  debugError?: DebugErrorLog | null;
  lastSuccessLog?: {
    action: string;
    endpoint: string;
    durationMs?: number;
    details?: any;
  } | null;
  className?: string;
  defaultExpanded?: boolean;
}

export const DiagnosticInspector: React.FC<DiagnosticInspectorProps> = ({
  debugError,
  lastSuccessLog,
  className = "",
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || Boolean(debugError),
  );
  const [copied, setCopied] = useState(false);

  if (!debugError && !lastSuccessLog) {
    return null;
  }

  const logPayload = {
    timestamp: new Date().toISOString(),
    error: debugError || null,
    success: lastSuccessLog || null,
    userAgent: navigator.userAgent,
    currentUrl: window.location.href,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(logPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`rounded-xl border transition-all text-xs overflow-hidden ${
        debugError
          ? "bg-red-950/40 border-red-500/30 text-red-200"
          : "bg-slate-900/60 border-white/10 text-slate-300"
      } ${className}`}
    >
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          {debugError ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
          ) : (
            <Bug className="w-4 h-4 text-pink-400 shrink-0" />
          )}
          <span className="font-semibold text-slate-200">
            {debugError
              ? "Live Error Diagnostics & Inspector"
              : "System Diagnostic Log"}
          </span>
          {debugError?.httpStatus && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30">
              HTTP {debugError.httpStatus}
            </span>
          )}
          {lastSuccessLog && !debugError && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              OK 200{" "}
              {lastSuccessLog.durationMs
                ? `(${lastSuccessLog.durationMs}ms)`
                : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] flex items-center gap-1 transition-all"
            title="Copy debug log to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Log</span>
              </>
            )}
          </button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 bg-black/40 border-t border-white/5 font-mono text-[11px]">
          {debugError && (
            <>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                  Error Message & Endpoint:
                </div>
                <div className="p-2 rounded bg-red-900/30 border border-red-500/30 text-red-200 font-sans break-words">
                  <span className="font-bold text-red-300 font-mono">
                    [{debugError.endpoint}]{" "}
                  </span>
                  {debugError.message}
                </div>
              </div>

              {debugError.suggestions && debugError.suggestions.length > 0 && (
                <div>
                  <div className="text-amber-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recommended Solution:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 font-sans pl-1">
                    {debugError.suggestions.map((s, idx) => (
                      <li key={idx} className="text-amber-200/90">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {debugError.details && (
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Technical Payload Details:
                  </div>
                  <pre className="p-2.5 rounded bg-black/60 border border-white/10 text-slate-300 overflow-x-auto text-[10px] max-h-36 overflow-y-auto">
                    {JSON.stringify(debugError.details, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}

          {lastSuccessLog && !debugError && (
            <div>
              <div className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                Last Successful Action:
              </div>
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 font-sans">
                {lastSuccessLog.action} via {lastSuccessLog.endpoint}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
