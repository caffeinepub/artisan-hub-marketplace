import { useGetCallerUserRole, useGetAllArtists, useDeleteUser } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';
import type { ArtistProfile } from '../backend';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function UserManagement() {
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: artists, isLoading: artistsLoading, error } = useGetAllArtists();
  const deleteUser = useDeleteUser();
  const navigate = useNavigate();

  const [artistToDelete, setArtistToDelete] = useState<ArtistProfile | null>(null);

  useEffect(() => {
    if (!roleLoading && userRole !== 'admin') {
      navigate({ to: '/products' });
    }
  }, [userRole, roleLoading, navigate]);

  const handleDeleteUser = async () => {
    if (!artistToDelete) return;

    try {
      const userPrincipal = Principal.fromText(artistToDelete.id);
      await deleteUser.mutateAsync(userPrincipal);
      toast.success('User deleted successfully. Transaction history has been preserved.');
      setArtistToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

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
            <Card key={artist.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/assets/generated/artist-placeholder.dim_200x200.png" />
                      <AvatarFallback>{artist.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{artist.name}</h3>
                        <Badge variant={artist.isActive ? 'default' : 'secondary'}>
                          {artist.isActive ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{artist.email}</p>
                      {artist.stripeAccountId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Stripe Connected
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setArtistToDelete(artist)}
                    disabled={deleteUser.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!artistToDelete} onOpenChange={(open) => !open && setArtistToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{artistToDelete?.name}</strong>? This action cannot be undone.
              <br /><br />
              <strong>Note:</strong> All transaction history will be preserved for audit and financial records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUser.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
