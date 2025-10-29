import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Target, 
  Home, 
  BookOpen, 
  Trophy, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings,
  X,
  BookLock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: Home, roles: ['student', 'teacher', 'admin'] }
    ];

    const roleSpecificItems = {
      student: [
        { name: 'Tasks', href: '/tasks', icon: BookOpen },
        {name: 'Submitted Tasks', href:'/submitted', icon: BookLock},
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy }
      ],
      teacher: [
        { name: 'Manage Tasks', href: '/manage-tasks', icon: CheckSquare },
        { name: 'Submissions', href: '/submissions', icon: Users },
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy }
      ],
      admin: [
        { name: 'Overview', href: '/overview', icon: BarChart3 },
        { name: 'Global Leaderboard', href: '/global-leaderboard', icon: Trophy },
        { name: 'Manage Tasks', href: '/manage-tasks', icon: CheckSquare },
        { name: 'All Submissions', href: '/submissions', icon: Users }
      ]
    };

    return [
      ...baseItems.filter(item => item.roles.includes(user?.role)),
      ...(roleSpecificItems[user?.role] || [])
    ];
  };

  const navigationItems = getNavigationItems();

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      onClick={() => onClose()}
      className={({ isActive }) =>
        `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-500'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <item.icon
        className="mr-3 h-5 w-5 flex-shrink-0"
        aria-hidden="true"
      />
      {item.name}
    </NavLink>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Atlas</span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-grow px-2 space-y-1">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* Bottom section */}
          <div className="flex-shrink-0 px-2">
            <div className="border-t border-gray-200 pt-4">
              <NavLink
                to="/settings"
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                Settings
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-5 pb-4">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 mb-8">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Atlas</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-2 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            {/* Bottom section */}
            <div className="flex-shrink-0 px-2">
              <div className="border-t border-gray-200 pt-4">
                <NavLink
                  to="/settings"
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                  Settings
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;