import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/layout";

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <DashboardLayout user={{ name: session.name, email: session.email }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.name}! Here&apos;s an overview of your
          properties.
        </p>

        {/* Dashboard content will be added in Phase 5 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Total Properties
            </h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Units</h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Occupied Units
            </h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Monthly Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900">₱0</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
