import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserStats } from '../types';
import api from '../services/apiService';
import {
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ success: boolean; stats: UserStats }>('/users/stats');
        setStats(response.stats);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-primary-600 hover:text-primary-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Sriox.com</h1>
        <p className="text-gray-600">
          Your self-hosted domain and hosting platform. Host websites, create redirects, and map GitHub Pages - all in one place.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Site Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <DocumentTextIcon className="h-8 w-8 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900">Your Sites</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">{stats.sites.used}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Limit</span>
                <span className="font-medium">
                  {stats.sites.limit < 0 ? 'Unlimited' : stats.sites.limit}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(stats.sites.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/sites"
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Manage Sites →
              </Link>
            </div>
          </div>

          {/* Redirect Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ArrowTopRightOnSquareIcon className="h-8 w-8 text-secondary-500" />
              <h2 className="text-lg font-semibold text-gray-900">Your Redirects</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">{stats.redirects.used}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Limit</span>
                <span className="font-medium">
                  {stats.redirects.limit < 0 ? 'Unlimited' : stats.redirects.limit}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-secondary-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(stats.redirects.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/redirects"
                className="text-secondary-600 hover:text-secondary-800 text-sm font-medium"
              >
                Manage Redirects →
              </Link>
            </div>
          </div>

          {/* GitHub Pages Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CodeBracketIcon className="h-8 w-8 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">GitHub Pages</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">{stats.githubPages.used}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Limit</span>
                <span className="font-medium">
                  {stats.githubPages.limit < 0 ? 'Unlimited' : stats.githubPages.limit}
                </span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(stats.githubPages.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/github-pages"
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Manage GitHub Pages →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Current Plan:</p>
            <p className="text-lg font-medium">
              {stats?.plan.name || 'Loading...'}
              {stats?.plan.isPro && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  PRO
                </span>
              )}
            </p>
          </div>
          {!stats?.plan.isPro && (
            <Link
              to="/account"
              className="btn btn-primary text-sm"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;