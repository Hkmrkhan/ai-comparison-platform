'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/auth/login');
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ FIXED: Empty dependency array with ESLint disable comment

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
        return;
      }

      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with Logout Button */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.email}</p>
            </div>
            
            {/* Professional Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-6 py-2 border-2 border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">User ID:</span>
              <span className="font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Account Created:</span>
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions - Go to Compare Page */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h3 className="text-2xl font-semibold mb-3">Compare AI Models</h3>
          <p className="text-gray-600 mb-6">
            Test and compare different AI models side by side to see which one performs best for your needs
          </p>
          <button
            onClick={() => router.push('/compare')}
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-md font-medium transition-colors"
          >
            Go to Comparison
          </button>
        </div>
      </div>
    </div>
  );
}