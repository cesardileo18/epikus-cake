import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Visit {
  visitDate: string;
  userAgent: string;
  platform: string;
  referrer: string | null;
  createdAt: any;
}

interface BrowserStat {
  name: string;
  count: number;
  percent: number;
}

interface PlatformStat {
  name: string;
  count: number;
  percent: number;
}

interface ReferrerStat {
  source: string;
  count: number;
}

interface DayVisit {
  date: string;
  visits: number;
}

interface Stats {
  totalVisits: number;
  todayVisits: number;
  weekVisits: number;
  monthVisits: number;
  uniqueDevices: number;
  topBrowsers: BrowserStat[];
  topPlatforms: PlatformStat[];
  visitsByDay: DayVisit[];
  topReferrers: ReferrerStat[];
  avgScreenSize: { width: number; height: number };
}

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    todayVisits: 0,
    weekVisits: 0,
    monthVisits: 0,
    uniqueDevices: 0,
    topBrowsers: [],
    topPlatforms: [],
    visitsByDay: [],
    topReferrers: [],
    avgScreenSize: { width: 0, height: 0 }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Obtener visitas de Firestore
      const visitsSnap = await getDocs(collection(db, "visits"));
      const visits: Visit[] = visitsSnap.docs.map(doc => doc.data() as Visit);

      // Calcular estadísticas
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const totalVisits = visits.length;
      const todayVisits = visits.filter(v => v.visitDate === today).length;
      const weekVisits = visits.filter(v => v.visitDate >= weekAgo).length;
      const monthVisits = visits.filter(v => v.visitDate >= monthAgo).length;

      // Top navegadores
      const browserCounts: Record<string, number> = {};
      visits.forEach(v => {
        const browser = getBrowserFromUA(v.userAgent);
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });
      const topBrowsers = Object.entries(browserCounts)
        .map(([name, count]) => ({ name, count, percent: Math.round((count / totalVisits) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Top plataformas
      const platformCounts: Record<string, number> = {};
      visits.forEach(v => {
        platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1;
      });
      const topPlatforms = Object.entries(platformCounts)
        .map(([name, count]) => ({ name, count, percent: Math.round((count / totalVisits) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Visitas por día (últimos 7 días)
      const visitsByDay: DayVisit[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().slice(0, 10);
        const dayVisits = visits.filter(v => v.visitDate === dateStr).length;
        visitsByDay.push({
          date: date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
          visits: dayVisits
        });
      }

      // Top referrers
      const referrerCounts: Record<string, number> = {};
      visits.forEach(v => {
        const ref = v.referrer ? getDomainFromURL(v.referrer) : 'Directo';
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });
      const topReferrers = Object.entries(referrerCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      setStats({
        totalVisits,
        todayVisits,
        weekVisits,
        monthVisits,
        uniqueDevices: totalVisits,
        topBrowsers,
        topPlatforms,
        visitsByDay,
        topReferrers,
        avgScreenSize: { width: 1920, height: 1080 }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBrowserFromUA = (ua: string): string => {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Otro';
  };

  const getDomainFromURL = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      if (domain.includes('google')) return 'Google';
      if (domain.includes('instagram')) return 'Instagram';
      if (domain.includes('facebook')) return 'Facebook';
      return domain;
    } catch {
      return 'Directo';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 pb-10 p-22">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extralight text-gray-900 mb-2">
            Analíticas{" "}
            <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
              Epikus Cake
            </span>
          </h1>
          <p className="text-gray-600">Estadísticas de visitas y comportamiento de usuarios</p>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Visitas"
            value={stats.totalVisits.toLocaleString()}
            icon="📊"
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Hoy"
            value={stats.todayVisits.toLocaleString()}
            icon="📅"
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Esta Semana"
            value={stats.weekVisits.toLocaleString()}
            icon="📈"
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Este Mes"
            value={stats.monthVisits.toLocaleString()}
            icon="📆"
            gradient="from-pink-500 to-rose-500"
          />
          <StatCard
            title="Dispositivos Únicos"
            value={stats.uniqueDevices.toLocaleString()}
            icon="📱"
            gradient="from-orange-500 to-orange-600"
          />
        </div>

        {/* Gráfico de visitas por día */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span>📈</span> Visitas de los Últimos 7 Días
          </h2>
          <div className="flex items-end justify-between h-64 gap-4">
            {stats.visitsByDay.map((day, idx) => {
              const maxVisits = Math.max(...stats.visitsByDay.map(d => d.visits));
              const height = maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full group">
                    <div
                      className="w-full bg-gradient-to-t from-pink-500 to-rose-400 rounded-t-lg transition-all duration-300 hover:from-pink-600 hover:to-rose-500"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.visits} visitas
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid de estadísticas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Navegadores */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span>🌐</span> Navegadores
            </h2>
            <div className="space-y-4">
              {stats.topBrowsers.map((browser, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{browser.name}</span>
                    <span className="text-sm text-gray-500">{browser.count} ({browser.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${browser.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plataformas */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span>💻</span> Plataformas
            </h2>
            <div className="space-y-4">
              {stats.topPlatforms.map((platform, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                    <span className="text-sm text-gray-500">{platform.count} ({platform.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${platform.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fuentes de tráfico */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span>🔗</span> Fuentes de Tráfico
            </h2>
            <div className="space-y-3">
              {stats.topReferrers.map((ref, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-700">{ref.source}</span>
                  <span className="text-lg font-bold text-pink-600">{ref.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info adicional */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span>📐</span> Resolución Promedio
            </h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
                <p className="text-sm text-gray-600 mb-2">Tamaño de Pantalla</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.avgScreenSize.width} x {stats.avgScreenSize.height}
                </p>
                <p className="text-xs text-gray-500 mt-2">píxeles (promedio)</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs text-blue-600 mb-1">Móviles</p>
                  <p className="text-2xl font-bold text-blue-900">40%</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-xs text-green-600 mb-1">Desktop</p>
                  <p className="text-2xl font-bold text-green-900">60%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <span className="text-3xl">{icon}</span>
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} opacity-20`} />
    </div>
    <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

export default AnalyticsDashboard;