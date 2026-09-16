import { useAuth } from '@/modules/auth/hooks/use-auth';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedLayoutProps {
  allowed_roles?: ('admin' | 'user')[]
  children: React.ReactNode
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    
  const { data: admin, isLoading } = useAuth()
  const location = useLocation()
  
  if (isLoading) {
    return (
      <div className='h-screen w-screen flex justify-center items-center'>
        <div className="flex flex-col items-center gap-3">
        </div>
      </div>
    );
  }

  if(!admin) {
    return <Navigate to={`/login?redirect=${location.pathname}`} />
  }

  return <>{children}</>;
};
