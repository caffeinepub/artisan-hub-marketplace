import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterArtist } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ArtistBenefits from '../components/ArtistBenefits';

export default function ArtistRegistration() {
  const { identity } = useInternetIdentity();
  const registerArtist = useRegisterArtist();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identity) {
      toast.error('Please login first');
      return;
    }

    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const artistId = identity.getPrincipal().toString();
      await registerArtist.mutateAsync({
        id: artistId,
        name: name.trim(),
        email: email.trim(),
        isActive: true,
        stripeAccountId: undefined,
      });
      toast.success('Artist registration successful!');
      navigate({ to: '/artist/dashboard' });
    } catch (error) {
      toast.error('Failed to register as artist');
      console.error('Artist registration error:', error);
    }
  };

  if (!identity) {
    return (
      <div className="container py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login to register as an artist
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Become an Artist</h1>
          <p className="text-muted-foreground text-lg">
            Join our community of talented creators and start selling your work
          </p>
        </div>

        <ArtistBenefits />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Artist Registration</CardTitle>
            <CardDescription>
              Fill in your details to create your artist profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Artist Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your artist name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={registerArtist.isPending}>
                {registerArtist.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register as Artist'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
