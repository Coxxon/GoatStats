import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  MousePointer2,
  Clock,
  Settings as SettingsIcon,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import {
  Chart as ChartJS,
} from 'chart.js/auto';
import { Bar, Line } from 'react-chartjs-2';

import { fetchStats, fetchPageViews, fetchTopPages } from './services/goatCounter';

const App = () => {
  const isFetching = React.useRef(false);
  const [token, setToken] = useState(localStorage.getItem('goat_token') || '');
  const [siteCode, setSiteCode] = useState(localStorage.getItem('goat_site') || '');
  const [isConfigured, setIsConfigured] = useState(!!(token && siteCode));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    total: { visitors: '-', views: '-' },
    hits: [],
    pages: []
  });

  useEffect(() => {
    if (isConfigured) {
      loadData();
    }
  }, [isConfigured]);

  const loadData = async () => {
    if (isFetching.current) return;
    console.log("🚀 v1.1.5 - Démarrage du chargement...");
    isFetching.current = true;
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Appel API...');
      const [totalStats, hitsData, pagesData] = await Promise.all([
        fetchStats(token),
        fetchPageViews(token),
        fetchTopPages(token)
      ]);

      console.log('✅ Résultats reçus:', { totalStats, hitsData, pagesData });

      // Historique graphique (daily=1)
      const chartHistory = hitsData.history || hitsData.hits || (Array.isArray(hitsData) ? hitsData : []);

      // Top Pages (sans daily)
      const topPagesList = pagesData.hits || pagesData.pages || (Array.isArray(pagesData) ? pagesData : []);

      setStats({
        total: totalStats.total || { visitors: '0', views: '0' },
        hits: chartHistory,
        pages: topPagesList
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('❌ Erreur API:', err);
      setError(err.message || 'Erreur de connexion inconnue');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const chartData = {
    labels: stats.hits.map(h => new Date(h.day).toLocaleDateString(undefined, { weekday: 'short' })),
    datasets: [
      {
        label: 'Vues',
        data: stats.hits.map(h => h.count),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const cleanToken = token.trim();
    const cleanSite = siteCode.trim();

    if (!cleanToken || !cleanSite) {
      setError("Veuillez remplir les deux champs.");
      return;
    }

    localStorage.setItem('goat_token', cleanToken);
    localStorage.setItem('goat_site', cleanSite);
    setToken(cleanToken);
    setSiteCode(cleanSite);
    setIsConfigured(true);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center p-4">
        <div className="glass p-8 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <LayoutDashboard className="w-12 h-12 mx-auto text-indigo-500" />
            <h1 className="text-2xl font-bold">Configuration</h1>
            <p className="text-slate-400 text-sm">Entrez vos accès GoatCounter</p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Code du site (GoatCounter)</label>
              <input
                type="text"
                className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                placeholder="Ex: allanlg"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Clé API GoatCounter (Token)</label>
              <input
                type="password"
                className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Collez votre clé 1weag..."
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Générez une clé sur votre compte GoatCounter avec "Read Statistics".</p>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-bold transition-colors">
              Démarrer le Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            GoatStats <span className="text-[10px] text-slate-600 font-mono">v1.1.5</span>
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 text-sm">{siteCode}.goatcounter.com</p>
            {lastUpdated && (
              <span className="text-[10px] text-indigo-400/60 font-mono italic">
                • Mis à jour à {lastUpdated}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className={`p-2 glass-card rounded-lg hover:bg-slate-800 transition-colors ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={() => setIsConfigured(false)}
            className="p-2 glass-card rounded-lg hover:bg-slate-800 transition-colors"
          >
            <SettingsIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8 text-sm">
          <div className="flex items-center gap-2 mb-2 font-bold uppercase">
            ⚠️ Erreur détectée
          </div>
          <p>
            Détail : <strong>{error}</strong>
          </p>
          <div className="mt-3 text-[11px] opacity-80 border-t border-red-500/30 pt-2">
            <strong>Checklist :</strong><br />
            1. Vérifiez que votre Clé API (Token) est toujours active sur GoatCounter.<br />
            2. Vérifiez que le "Code du site" est bien <strong>{siteCode}</strong>.<br />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Visiteurs', value: stats.total.visitors, icon: Users, color: 'text-blue-400' },
          { label: 'Pages Vues', value: stats.total.views, icon: BarChart3, color: 'text-indigo-400' },
          { label: 'Taux de Rebond', value: '-', icon: MousePointer2, color: 'text-emerald-400' },
          { label: 'Temps Moyen', value: '-', icon: Clock, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 space-y-2">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6">
          <h3 className="text-lg font-semibold mb-6">Activités</h3>
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                  x: { grid: { display: false }, ticks: { color: '#64748b' } }
                }
              }}
            />
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-6">Top Pages</h3>
          <div className="space-y-4">
            {stats.pages.length > 0 ? (
              stats.pages.slice(0, 5).map((page, i) => (
                <div key={i} className="flex justify-between items-center p-3 glass-card rounded-lg">
                  <span className="text-sm font-mono text-slate-400 truncate mr-4">{page.path}</span>
                  <span className="text-sm font-bold text-indigo-400">{page.count}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm italic">Aucune donnée trouvée...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
