import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { BurnChart } from '@/components/BurnChart';
import { InflationChart } from '@/components/InflationChart';
import { UnvestingChart } from '@/components/UnvestingChart';
import { PriceDisplay } from '@/components/PriceDisplay';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Price Display Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Price Overview</h2>
          <div className="flex justify-center">
            <PriceDisplay />
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Burn Statistics</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Burned" query="burns/summary" dataKey="totalBurned" />
            <StatCard title="Today's Burns" query="burns/summary" dataKey="todayBurns" />
            <StatCard title="Burn Rate" query="burns/summary" dataKey="dailyBurnRate" />
            <StatCard title="Current Price" query="burns/summary" dataKey="currentUniPrice" />
          </div>
        </section>

        {/* Charts Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Analytics</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <BurnChart />
            <InflationChart />
          </div>
        </section>

        {/* Unvesting Chart */}
        <section className="mb-12">
          <UnvestingChart />
        </section>
      </div>

      <Footer />
    </main>
  );
}
