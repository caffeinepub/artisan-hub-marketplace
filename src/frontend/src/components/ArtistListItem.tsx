import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useActivateArtist, useDeactivateArtist } from '../hooks/useQueries';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ArtistProfile } from '../backend';

interface ArtistListItemProps {
  artist: ArtistProfile;
}

export default function ArtistListItem({ artist }: ArtistListItemProps) {
  const activateArtist = useActivateArtist();
  const deactivateArtist = useDeactivateArtist();

  const handleToggleStatus = async () => {
    try {
      if (artist.isActive) {
        await deactivateArtist.mutateAsync(artist.id);
        toast.success('Artist deactivated successfully');
      } else {
        await activateArtist.mutateAsync(artist.id);
        toast.success('Artist activated successfully');
      }
    } catch (error) {
      toast.error('Failed to update artist status');
      console.error('Artist status update error:', error);
    }
  };

  const isPending = activateArtist.isPending || deactivateArtist.isPending;

  return (
    <Card>
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
            variant={artist.isActive ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleStatus}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : artist.isActive ? (
              'Deactivate'
            ) : (
              'Activate'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
