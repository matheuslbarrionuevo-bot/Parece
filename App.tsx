
import React, { useState } from 'react';
import { UserRole } from './types';
import { Layout } from './components/Layout';
import { BrandDashboard } from './components/BrandDashboard';
import { FreelancerMarketplace } from './components/FreelancerMarketplace';
import { NotificationCenter } from './components/NotificationCenter';

function App() {
  const [role, setRole] = useState<UserRole>(UserRole.FREELANCER);

  return (
    <Layout role={role} setRole={setRole}>
      <NotificationCenter />
      
      {role === UserRole.BRAND_MANAGER ? (
        <BrandDashboard />
      ) : (
        <FreelancerMarketplace />
      )}
      
      {/* Mobile persistent help/CTA button */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button className="bg-slate-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </Layout>
  );
}

export default App;
