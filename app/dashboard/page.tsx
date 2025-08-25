import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/layout";
import { getProperties } from "@/lib/actions/properties";
import { getAllUnits } from "@/lib/actions/units";
import { getLeaseAnalytics } from "@/lib/actions/leases";

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  try {
    const [properties, units, analyticsResult] = await Promise.all([
      getProperties(),
      getAllUnits(),
      getLeaseAnalytics(),
    ]);

    // Calculate stats
    const totalProperties = properties.length;
    const totalUnits = units.length;
    const occupiedUnits = units.filter((unit) => !unit.isAvailable).length;
    const occupancyRate =
      totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : "0";

    // Get monthly revenue from analytics
    const monthlyRevenue = analyticsResult.error
      ? 0
      : analyticsResult.totalMonthlyRevenue || 0;

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <DashboardLayout user={{ name: session.name, email: session.email }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session.name}! Here&apos;s an overview of your
            properties.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Total Properties
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {totalProperties}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Units</h3>
              <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Occupancy Rate
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {occupancyRate}%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {occupiedUnits} of {totalUnits} units
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Monthly Revenue
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyRevenue)}
              </p>
            </div>
          </div>

          {/* Lease status summary */}
          {!analyticsResult.error && analyticsResult.leaseStats && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Lease Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsResult.leaseStats.map(
                  (stat: {
                    status: "active" | "terminated" | "expired" | null;
                    count: number;
                    totalRevenue: number;
                  }) => (
                    <div
                      key={stat.status || "unknown"}
                      className="bg-white p-4 rounded-lg shadow"
                    >
                      <h4 className="text-sm font-medium text-gray-500 capitalize">
                        {stat.status || "Unknown"} Leases
                      </h4>
                      <p className="text-xl font-bold text-gray-900">
                        {stat.count}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(stat.totalRevenue || 0)} total
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <DashboardLayout user={{ name: session.name, email: session.email }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-red-600 mt-2">
            Error loading dashboard data. Please try refreshing the page.
          </p>
        </div>
      </DashboardLayout>
    );
  }
}
