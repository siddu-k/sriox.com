import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircleIcon,
  CloudArrowUpIcon, 
  ArrowPathIcon, 
  LinkIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Static Site Hosting',
    description: 'Upload your static sites and host them under your sriox.com subdomain.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'URL Redirects',
    description: 'Create custom redirects to send visitors to any external URL.',
    icon: LinkIcon,
  },
  {
    name: 'GitHub Pages Mapping',
    description: 'Connect your GitHub Pages repositories to a sriox.com subdomain.',
    icon: ArrowPathIcon,
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: [
      '2 static websites',
      '2 URL redirects',
      '2 GitHub Pages mappings',
      '35MB upload limit',
    ],
    cta: 'Get Started',
    isPro: false,
  },
  {
    name: 'Pro',
    price: '$5',
    frequency: '/month',
    features: [
      'Unlimited static websites',
      'Unlimited URL redirects',
      'Unlimited GitHub Pages mappings',
      '35MB upload limit',
      'Custom branding',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    isPro: true,
  },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Navigation */}
      <header className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <span className="text-2xl font-bold text-gray-900">Sriox.com</span>
            </div>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100"></div>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 mix-blend-multiply"></div>
              </div>
              <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-white">Host your projects on</span>
                  <span className="block text-white">sriox.com</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-white sm:max-w-3xl">
                  Get a free subdomain for your websites, GitHub Pages, or create simple URL redirects - all in one place.
                </p>
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-50 sm:px-8"
                    >
                      Get started
                    </Link>
                    <a
                      href="#features"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="py-16 bg-gray-100 overflow-hidden lg:py-24">
          <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
            <div className="relative">
              <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for your websites
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
                Sriox.com provides all the tools you need to host and share your web projects.
              </p>
            </div>

            <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
              {features.map((feature) => (
                <div key={feature.name} className="mt-10 lg:mt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg font-medium text-gray-900 text-center">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-500 text-center">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Start for free and upgrade only when you need more resources.
              </p>
            </div>

            <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${
                    plan.isPro ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  {plan.isPro && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-500 rounded-full py-1 px-4">
                      <p className="text-xs uppercase text-white font-semibold tracking-wide">
                        Most Popular
                      </p>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                    <p className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                      <span className="ml-1 text-xl font-semibold text-gray-500">
                        {plan.frequency}
                      </span>
                    </p>
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex">
                          <CheckCircleIcon
                            className={`flex-shrink-0 h-5 w-5 ${
                              plan.isPro ? 'text-primary-500' : 'text-green-500'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="ml-3 text-base text-gray-500">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8">
                    <Link
                      to={isAuthenticated ? (plan.isPro ? '/account' : '/dashboard') : '/register'}
                      className={`block w-full py-2 px-4 rounded-md shadow text-sm font-medium text-center ${
                        plan.isPro
                          ? 'bg-primary-600 hover:bg-primary-700 text-white'
                          : 'bg-white hover:bg-gray-50 text-primary-600 border border-primary-600'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2025 Sriox.com. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;