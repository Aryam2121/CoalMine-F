import React from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const PageNotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center page-wrap">
    <div className="card-surface max-w-md w-full text-center !py-12">
      <span className="text-6xl mb-4 block" aria-hidden>🗺️</span>
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">404</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        This section is not mapped yet. The page you requested does not exist.
      </p>
      <Link to="/" className="inline-block mt-8">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  </div>
);

export default PageNotFound;
