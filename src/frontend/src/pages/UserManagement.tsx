import { useGetCallerUserRole, useGetAllArtists } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ArtistListItem from '../components/ArtistListItem';

export default function UserManagement() {
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: artists, isLoading: artistsLoading, error } = useGetAllArtists();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && userRole !== 'admin') {
      navigate({ to: '/products' });
    }
  }, [userRole, roleLoading, navigate]);

  if (roleLoading || artistsLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage artist accounts and their status
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Failed to load artists. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {artists && artists.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            No artists registered yet.
          </p>
        </div>
      )}

      {artists && artists.length > 0 && (
        <div className="space-y-4">
          {artists.map((artist) => (
            <ArtistListItem key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}
