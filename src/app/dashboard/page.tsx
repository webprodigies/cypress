import { NewListDropdown } from '@/components/listDropdown';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React from 'react';

const Dashboard = () => {
  return (
    <div className="w-full">
      <NewListDropdown></NewListDropdown>
    </div>
  );
};

export default Dashboard;
