import React, { useState, useEffect } from 'react';
import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';
import { 
  Database, 
  Cloud, 
  KeyRound, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertTriangle,
  Server,
  RefreshCw,
  Activity,
  ShieldCheck,
  XCircle,
  FileCode
} from 'lucide-react';
import { checkVercelServiceStatus, VercelServiceStatus } from '../../lib/vercelClient';

export const VERCEL_POSTGRES_SCHEMA_SQL = `-- Vercel Postgres Tables Schema for Bagas & Anita

CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_type VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    author VARCHAR(50) NOT NULL,
    category VARCHAR(50) DEFAULT 'All',
    date VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    aspect_ratio NUMERIC DEFAULT 1.33,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS letters (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    recipient VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    stamp_emoji VARCHAR(20) DEFAULT '💌',
    is_read BOOLEAN DEFAULT FALSE,
    paper_color VARCHAR(30) DEFAULT 'rose',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    author VARCHAR(50) NOT NULL,
    color VARCHAR(30) DEFAULT 'pink',
    date VARCHAR(50) NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    emoji VARCHAR(20) DEFAULT '✨',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audios (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(100),
    url TEXT NOT NULL,
    duration VARCHAR(20) DEFAULT '0:00',
    author VARCHAR(50) NOT NULL,
    type VARCHAR(30) DEFAULT 'song',
    date VARCHAR(50) NOT NULL,
    cover_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    emoji VARCHAR(20) DEFAULT '💖',
    photo_url TEXT,
    location VARCHAR(255),
    category VARCHAR(50) DEFAULT 'Story',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'auth'>('status');
  const [copied, setCopied] = useState(false);
  const [copiedDiag, setCopiedDiag] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<VercelServiceStatus | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const fetchLiveStatus = async () => {
    setIsPinging(true);
    try {
      const status = await checkVercelServiceStatus();
      setServiceStatus(status);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveStatus();
    }
  }, [isOpen]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(VERCEL_POSTGRES_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDiagnostics = () => {
    navigator.clipboard.writeText(JSON.stringify(serviceStatus, null, 2));
    setCopiedDiag(true);
    setTimeout(() => setCopiedDiag(false), 2000);
  };

  const isBlobReady = serviceStatus?.blob?.hasToken ?? serviceStatus?.hasBlobToken;
  const isDbReady = serviceStatus?.postgres?.hasConfig ?? serviceStatus?.hasPostgres;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-pink-400" />
          <span>Vercel Native Storage & System</span>
        </div>
      }
      maxWidth="xl"
    >
      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'status'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Live Storage Status
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'schema'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          Postgres Schema
        </button>
        <button
          onClick={() => setActiveTab('auth')}
          className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'auth'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          Couple Auth & PIN
        </button>
      </div>

      {activeTab === 'status' && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBlobReady && isDbReady ? 'bg-emerald-400' : 'bg-pink-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isBlobReady && isDbReady ? 'bg-emerald-500' : 'bg-pink-500'
                }`}></span>
              </span>
              <span className="text-slate-300 font-medium">
                Live Backend Diagnostics {serviceStatus?.executionTimeMs ? `(${serviceStatus.executionTimeMs}ms ping)` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyDiagnostics}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs flex items-center gap-1 transition-all"
                title="Copy live health report JSON"
              >
                {copiedDiag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDiag ? 'Copied' : 'Copy Report'}</span>
              </button>
              <button
                type="button"
                onClick={fetchLiveStatus}
                disabled={isPinging}
                className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs flex items-center gap-1 transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Test Live Ping</span>
              </button>
            </div>
          </div>

          {/* Vercel Blob Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Vercel Blob Media Engine</span>
                {isBlobReady ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected & Active
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Local / Fallback Mode
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Stores high-resolution photos, videos, and voice notes into <code className="text-pink-300">photos/</code>, <code className="text-pink-300">videos/</code>, and <code className="text-pink-300">audio/</code> folders on Vercel Native Blob storage.
              </p>
              {serviceStatus?.blob?.tokenPreview && (
                <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-slate-500">Token:</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/40 text-pink-300 border border-white/5">
                    {serviceStatus.blob.tokenPreview}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vercel Postgres Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Vercel Postgres (Neon) & State Sync</span>
                {isDbReady ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {serviceStatus?.postgres?.pingMs !== null ? `${serviceStatus?.postgres?.pingMs}ms Ping` : 'Connected'}
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Offline / Local Cache
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Persists gallery items, love letters, sticky notes, and audio player states. Automatically synced on page loads.
              </p>

              {/* Verified Tables Badges */}
              {serviceStatus?.postgres?.tables && serviceStatus.postgres.tables.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Verified DB Tables:</span>
                  {serviceStatus.postgres.tables.map((tbl) => (
                    <span
                      key={tbl}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-200"
                    >
                      ✓ {tbl}
                    </span>
                  ))}
                </div>
              )}

              {serviceStatus?.postgres?.error && (
                <div className="mt-2 p-2 rounded bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                  <span className="font-bold">Postgres Info:</span> {serviceStatus.postgres.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">PostgreSQL table definitions:</span>
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={handleCopySchema}
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied!' : 'Copy SQL'}
            </GlassButton>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-pink-200 overflow-x-auto max-h-72">
            {VERCEL_POSTGRES_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {activeTab === 'auth' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Fixed Couple Login Credentials
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="text-pink-300 font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Bagas ID
                </div>
                <div className="text-white">ID: <code className="text-pink-200 font-mono">Bagas</code></div>
                <div className="text-white">PIN: <code className="text-pink-200 font-mono">1803</code></div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="text-pink-300 font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Anita ID
                </div>
                <div className="text-white">ID: <code className="text-pink-200 font-mono">Anita</code></div>
                <div className="text-white">PIN: <code className="text-pink-200 font-mono">1209</code></div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Universal master password: <code className="text-pink-300 font-mono">bagas ganteng banget</code>
            </div>
          </div>
        </div>
      )}
    </GlassModal>
  );
};
