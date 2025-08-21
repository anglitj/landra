import { Button } from "@/components/ui/button";
import { Building, Users, DollarSign, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Landra
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signin">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            AI-Powered Property Management
            <span className="block text-blue-600">
              for Filipino Property Owners
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Streamline your property management with intelligent automation,
            tenant communication, and financial tracking. Built specifically for
            the Philippine real estate market.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signin">
              <Button size="lg" className="px-8">
                Start Managing Properties
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Property Management
            </h3>
            <p className="text-gray-600">
              Manage multiple properties and units with ease. Track
              availability, pricing, and amenities.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tenant Management
            </h3>
            <p className="text-gray-600">
              Keep track of tenant information, lease agreements, and
              communication history.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Tracking
            </h3>
            <p className="text-gray-600">
              Monitor rent payments, track overdue amounts, and generate
              financial reports.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Chatbot
            </h3>
            <p className="text-gray-600">
              Automated tenant inquiries and lead generation with intelligent
              responses.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 text-center bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Property Management?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of Filipino property owners who trust Landra to manage
            their real estate investments.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="px-12">
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-blue-400" />
            <span className="ml-2 text-xl font-bold">Landra</span>
          </div>
          <p className="text-gray-400">
            Intelligent Property Management for Filipino Property Owners
          </p>
        </div>
      </footer>
    </div>
  );
}
