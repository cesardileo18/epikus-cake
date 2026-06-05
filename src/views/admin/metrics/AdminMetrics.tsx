import { useState, useEffect } from 'react';
import {
  BarChart3,
  CalendarDays,
  Globe,
  Link as LinkIcon,
  Monitor,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getAllVisits } from '@/services/analytics.service';
import {
  AdminCard,
  AdminHeader,
  AdminLoader,
  AdminPage,
  MetricCard,
  SectionTitle,
} from '@/components/admin/ui';

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

const AdminMetrics: React.FC = () => {
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
    avgScreenSize: { width: 0, height: 0 },
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const visits = await getAllVisits();

      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const totalVisits = visits.length;
      const todayVisits = visits.filter((v) => v.visitDate === today).length;
      const weekVisits = visits.filter((v) => v.visitDate >= weekAgo).length;
      const monthVisits = visits.filter((v) => v.visitDate >= monthAgo).length;

      const browserCounts: Record<string, number> = {};
      visits.forEach((v) => {
        const browser = getBrowserFromUA(v.userAgent);
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });
      const topBrowsers = Object.entries(browserCounts)
        .map(([name, count]) => ({
          name,
          count,
          percent: Math.round((count / totalVisits) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      const platformCounts: Record<string, number> = {};
      visits.forEach((v) => {
        platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1;
      });
      const topPlatforms = Object.entries(platformCounts)
        .map(([name, count]) => ({
          name,
          count,
          percent: Math.round((count / totalVisits) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      const visitsByDay: DayVisit[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().slice(0, 10);
        const dayVisits = visits.filter((v) => v.visitDate === dateStr).length;
        visitsByDay.push({
          date: date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
          visits: dayVisits,
        });
      }

      const referrerCounts: Record<string, number> = {};
      visits.forEach((v) => {
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
        avgScreenSize: { width: 1920, height: 1080 },
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
    return <AdminLoader label="Cargando estadisticas..." />;
  }

  const maxVisits = Math.max(...stats.visitsByDay.map((d) => d.visits), 1);

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Analytics"
        eyebrowIcon={<BarChart3 size={14} />}
        title="Estadisticas"
        highlight="Epikus Cake"
        description="Visitas y comportamiento de usuarios en tiempo real."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          value={stats.totalVisits.toLocaleString()}
          label="Total visitas"
          icon={<BarChart3 size={18} />}
        />
        <MetricCard
          value={stats.todayVisits.toLocaleString()}
          label="Hoy"
          tone="green"
          icon={<CalendarDays size={18} />}
        />
        <MetricCard
          value={stats.weekVisits.toLocaleString()}
          label="Esta semana"
          tone="purple"
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          value={stats.monthVisits.toLocaleString()}
          label="Este mes"
          tone="pink"
          icon={<CalendarDays size={18} />}
        />
        <MetricCard
          value={stats.uniqueDevices.toLocaleString()}
          label="Dispositivos"
          tone="amber"
          icon={<Users size={18} />}
        />
      </div>

      <AdminCard>
        <SectionTitle
          icon={TrendingUp}
          title="Visitas de los ultimos 7 dias"
          description="Distribucion diaria de visitas."
        />
        <div className="mt-6 flex h-56 items-end justify-between gap-3">
          {stats.visitsByDay.map((day, idx) => {
            const height = (day.visits / maxVisits) * 100;
            return (
              <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                <div className="group relative w-full">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-pink-600 to-pink-400 transition-all hover:from-pink-500 hover:to-pink-300"
                    style={{ height: `${height}%`, minHeight: '12px' }}
                  />
                  <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0c0e1a] px-2 py-1 text-[11px] font-semibold text-slate-200 opacity-0 transition-opacity group-hover:opacity-100">
                    {day.visits} visitas
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500">{day.date}</span>
              </div>
            );
          })}
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AdminCard>
          <SectionTitle icon={Globe} title="Navegadores" />
          <div className="mt-5 space-y-4">
            {stats.topBrowsers.map((browser, idx) => (
              <div key={idx}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{browser.name}</span>
                  <span className="text-xs text-slate-400">
                    {browser.count} ({browser.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500"
                    style={{ width: `${browser.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionTitle icon={Monitor} title="Plataformas" />
          <div className="mt-5 space-y-4">
            {stats.topPlatforms.map((platform, idx) => (
              <div key={idx}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{platform.name}</span>
                  <span className="text-xs text-slate-400">
                    {platform.count} ({platform.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                    style={{ width: `${platform.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionTitle icon={LinkIcon} title="Fuentes de trafico" />
          <div className="mt-5 space-y-2">
            {stats.topReferrers.map((ref, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
              >
                <span className="text-sm font-bold text-white">{ref.source}</span>
                <span className="text-base font-bold text-pink-300">{ref.count}</span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <SectionTitle icon={Smartphone} title="Resolucion promedio" />
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-pink-500/25 bg-pink-500/[0.06] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-pink-300">
                Tamano de pantalla
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {stats.avgScreenSize.width} × {stats.avgScreenSize.height}
              </p>
              <p className="mt-1 text-xs text-slate-400">pixeles (promedio)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-sky-400/20 bg-sky-400/[0.05] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300">Movil</p>
                <p className="mt-1 text-xl font-bold text-white">40%</p>
              </div>
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                  Desktop
                </p>
                <p className="mt-1 text-xl font-bold text-white">60%</p>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  );
};

export default AdminMetrics;
