import AnalyticsDashboard from '../../features/analytics/AnalyticsDashboard';

export default function AdminDashboard() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Admin Dashboard</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Analytics Overview</h2>
      </div>

      <AnalyticsDashboard />
    </section>
  );
}