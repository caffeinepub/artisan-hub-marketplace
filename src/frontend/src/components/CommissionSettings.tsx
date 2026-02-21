import { useState, useEffect } from 'react';
import { useGetCommissionRate, useSetCommissionRate } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Percent } from 'lucide-react';
import { toast } from 'sonner';

export default function CommissionSettings() {
  const { data: currentRate, isLoading } = useGetCommissionRate();
  const setRate = useSetCommissionRate();
  const [rate, setRateValue] = useState('10');

  useEffect(() => {
    if (currentRate !== undefined) {
      setRateValue(currentRate.toString());
    }
  }, [currentRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numRate = parseInt(rate);
    
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      toast.error('Commission rate must be between 0 and 100');
      return;
    }

    try {
      await setRate.mutateAsync(BigInt(numRate));
      toast.success('Commission rate updated successfully!');
    } catch (error) {
      toast.error('Failed to update commission rate');
      console.error('Commission rate error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="commission">Platform Commission Rate (%)</Label>
        <div className="relative">
          <Input
            id="commission"
            type="number"
            min="0"
            max="100"
            value={rate}
            onChange={(e) => setRateValue(e.target.value)}
            className="pr-10"
            required
          />
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          Artists receive {100 - parseInt(rate || '0')}% of each sale
        </p>
      </div>

      <div className="bg-muted/50 p-3 rounded-lg text-sm">
        <p className="text-muted-foreground">
          <strong>Note:</strong> Changes apply to future transactions only. Existing transactions are not affected.
        </p>
      </div>

      <Button type="submit" disabled={setRate.isPending}>
        {setRate.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Update Commission Rate'
        )}
      </Button>
    </form>
  );
}
