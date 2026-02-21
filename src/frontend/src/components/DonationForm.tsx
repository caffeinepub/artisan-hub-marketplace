import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductType } from '../backend';
import { useAddProduct } from '../hooks/useQueries';

interface DonationFormData {
  name: string;
  description: string;
  suggestedAmount: string;
  categoryName: string;
}

interface DonationFormProps {
  artistId: string;
  onSuccess?: () => void;
}

export default function DonationForm({ artistId, onSuccess }: DonationFormProps) {
  const [open, setOpen] = useState(false);
  const addProduct = useAddProduct();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonationFormData>();

  const onSubmit = async (data: DonationFormData) => {
    try {
      const priceInCents = Math.round(parseFloat(data.suggestedAmount) * 100);

      await addProduct.mutateAsync({
        id: `donation-${Date.now()}-${Math.random()}`,
        artistId,
        name: data.name,
        description: data.description,
        price: BigInt(priceInCents),
        categoryName: data.categoryName || 'Support',
        productType: ProductType.donation,
        imageUrls: [],
        videoUrl: undefined,
      });

      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create donation:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Heart className="mr-2 h-4 w-4" />
          Create Donation Option
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Donation Option</DialogTitle>
          <DialogDescription>
            Set up a way for supporters to contribute to your work. You can suggest an amount, but
            supporters can donate any amount they choose.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Title *</Label>
            <Input
              id="name"
              placeholder="e.g., Support My Art"
              {...register('name', { required: 'Title is required' })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Tell supporters how their donation helps..."
              rows={4}
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestedAmount">Suggested Amount (USD) *</Label>
            <Input
              id="suggestedAmount"
              type="number"
              step="0.01"
              min="1"
              placeholder="10.00"
              {...register('suggestedAmount', {
                required: 'Suggested amount is required',
                min: { value: 1, message: 'Minimum amount is $1.00' },
              })}
            />
            {errors.suggestedAmount && (
              <p className="text-sm text-destructive">{errors.suggestedAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryName">Category</Label>
            <Input
              id="categoryName"
              placeholder="e.g., General Support"
              defaultValue="Support"
              {...register('categoryName')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProduct.isPending}>
              {addProduct.isPending ? 'Creating...' : 'Create Donation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
