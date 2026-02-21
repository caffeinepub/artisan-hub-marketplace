import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  ArtistProfile,
  Product,
  StripeConfiguration,
  StoreSettings,
  SocialLinks,
  ExternalBlob,
  UserRole,
} from '../backend';

// User Profiles
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Artists
export function useRegisterArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ArtistProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerArtist(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

export function useGetArtist(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile | null>({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getArtist(artistId);
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

export function useGetAllArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtists();
    },
    enabled: !!actor && !isFetching,
  });
}

// Products
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductsFiltered(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'artist', artistId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsFiltered(artistId);
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useBulkUploadProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: Product[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProductsBulk(products);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Commission Rate
export function useGetPlatformCommissionRate() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['commissionRate'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlatformCommissionRate();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCommissionRate() {
  return useGetPlatformCommissionRate();
}

export function useSetPlatformCommissionRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rate: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPlatformCommissionRate(rate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissionRate'] });
    },
  });
}

export function useSetCommissionRate() {
  return useSetPlatformCommissionRate();
}

// Stripe Configuration
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

// Store Settings
export function useGetStoreSettings(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StoreSettings | null>({
    queryKey: ['storeSettings', artistId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStoreSettings(artistId);
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

export function useUpdateStoreSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artistId,
      storeName,
      storeBio,
      bannerImage,
      socialLinks,
    }: {
      artistId: string;
      storeName: string;
      storeBio: string;
      bannerImage: ExternalBlob | null;
      socialLinks: SocialLinks;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStoreSettings(artistId, storeName, storeBio, bannerImage, socialLinks);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings', variables.artistId] });
    },
  });
}

// Artist activation/deactivation (placeholder - not in backend)
export function useActivateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      // This functionality is not available in the backend
      throw new Error('Artist activation not implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

export function useDeactivateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      // This functionality is not available in the backend
      throw new Error('Artist deactivation not implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}
