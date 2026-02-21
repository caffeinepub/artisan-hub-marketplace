import { Link } from '@tanstack/react-router';
import { Palette, UserPlus } from 'lucide-react';

export default function UserNav() {
  return (
    <>
      <Link 
        to="/artist/dashboard" 
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden lg:inline">My Studio</span>
      </Link>
      <Link 
        to="/artist/register" 
        className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
      >
        <UserPlus className="h-4 w-4" />
        <span className="hidden lg:inline">Become Artist</span>
      </Link>
    </>
  );
}
