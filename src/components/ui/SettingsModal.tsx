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
  Server
} from 'lucide-react';
import { checkVercelServiceStatus, VercelServiceStatus } from '../../lib/vercelClient';
import { memoryStorage } from '../../lib/storage';

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
  const [resetConfirm, setResetConfirm] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<VercelServiceStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkVercelServiceStatus().then(setServiceStatus);
    }
  }, [isOpen]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(VERCEL_POSTGRES_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetData = () => {
    memoryStorage.resetToDefault();
    onRefreshData();
    setResetConfirm(false);
    onClose();
  };

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
          className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'status'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Storage Status
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'schema'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Postgres Schema
        </button>
        <button
          onClick={() => setActiveTab('auth')}
          className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'auth'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Couple Auth & PIN
        </button>
      </div>

      {activeTab === 'status' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-white flex items-center gap-2">
                <span>Vercel Blob Media Engine</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                  Active
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Photos, videos, and voice notes are automatically organized into category folders (<code className="text-pink-300">photos/</code>, <code className="text-pink-300">videos/</code>, <code className="text-pink-300">audio/</code>) and stored permanently on Vercel Native Blob storage.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-white flex items-center gap-2">
                <span>Vercel Postgres & State Sync</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                  Persistent
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Memories, Love Letters, Sticky Notes, and Audio tracks are synced automatically upon page load and reload. All updates reflect instantly with zero latency.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {!resetConfirm ? (
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setResetConfirm(true)}
                className="text-slate-400 hover:text-rose-300 self-start text-xs"
              >
                Reset memories to default preset
              </GlassButton>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <span className="text-xs text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Reset all local memories?
                </span>
                <div className="flex gap-2">
                  <GlassButton size="sm" variant="ghost" onClick={() => setResetConfirm(false)}>Cancel</GlassButton>
                  <GlassButton size="sm" variant="danger" onClick={handleResetData}>Confirm Reset</GlassButton>
                </div>
              </div>
            )}
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
              Universal master password: <code className="text-pink-300 font-mono">saya123</code>
            </div>
          </div>
        </div>
      )}
    </GlassModal>
  );
};
