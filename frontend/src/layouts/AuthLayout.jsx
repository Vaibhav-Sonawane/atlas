import React from 'react';
import { BookOpen, Target, Trophy } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="flex flex-col justify-center px-12 text-white">
          <div className="flex items-center mb-8">
            <Target className="h-12 w-12 mr-4" />
            <h1 className="text-4xl font-bold">Atlas</h1>
          </div>
          
          <h2 className="text-3xl font-light mb-6">
            Empowering Education Through Technology
          </h2>
          
          <p className="text-xl text-blue-100 mb-12">
            Track progress, compete with peers, and achieve your learning goals.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 mr-4 text-blue-200" />
              <span className="text-lg">Interactive Learning Tasks</span>
            </div>
            <div className="flex items-center">
              <Trophy className="h-6 w-6 mr-4 text-blue-200" />
              <span className="text-lg">Competitive Leaderboards</span>
            </div>
            <div className="flex items-center">
              <Target className="h-6 w-6 mr-4 text-blue-200" />
              <span className="text-lg">Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center mb-4">
              <Target className="h-8 w-8 mr-2 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Atlas</h1>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;