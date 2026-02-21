import { Link } from '@tanstack/react-router';
import { LayoutDashboard, Users, TrendingUp } from 'lucide-react';

export default function AdminNav() {
  return (
    <>
      <Link 
        to="/admin/dashboard" 
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden lg:inline">Dashboard</span>
      </Link>
      <Link 
        to="/admin/users" 
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
      >
        <Users className="h-4 w-4" />
        <span className="hidden lg:inline">Users</span>
      </Link>
      <Link 
        to="/admin/revenue" 
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
      >
        <TrendingUp className="h-4 w-4" />
        <span className="hidden lg:inline">Revenue</span>
      </Link>
    </>
  );
}
