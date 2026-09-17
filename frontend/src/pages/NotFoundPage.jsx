import React from 'react';
import { Link } from 'react-router-dom';
import { EduKadenceLogo } from '../components/EduKadenceLogo';
import { Button } from '../components/ui';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <EduKadenceLogo className="h-10 mb-6" />
      <span className="text-4xl font-extrabold text-brand-600 mb-2">404</span>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The requested URL or experience route does not exist within this tenant scope.
      </p>
      <Link to="/app">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
