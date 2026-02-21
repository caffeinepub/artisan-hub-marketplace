import { Card, CardContent } from '@/components/ui/card';
import { Globe, Shield, Palette, TrendingUp } from 'lucide-react';

export default function ArtistBenefits() {
  const benefits = [
    {
      icon: Globe,
      title: 'Global Exposure',
      description: 'Reach customers worldwide through our marketplace',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Stripe-powered payment processing you can trust',
    },
    {
      icon: Palette,
      title: 'Easy Management',
      description: 'Simple tools to manage your products and sales',
    },
    {
      icon: TrendingUp,
      title: 'Fair Artist Compensation',
      description: 'Competitive earnings structure that values your work',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {benefits.map((benefit, index) => {
        const Icon = benefit.icon;
        return (
          <Card key={index} className="border-2">
            <CardContent className="pt-6">
              <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
