import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: string;
    categoryName: string;
    imageUrls: Array<string>;
    name: string;
    artistId: string;
    description: string;
    productType: ProductType;
    price: bigint;
    videoUrl?: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface StoreSettings {
    socialLinks: SocialLinks;
    storeName: string;
    bannerImage?: ExternalBlob;
    storeBio: string;
}
export interface SocialLinks {
    tiktok?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface ArtistProfile {
    id: string;
    stripeAccountId?: string;
    name: string;
    isActive: boolean;
    email: string;
}
export interface UserProfile {
    bio?: string;
    termsAccepted: boolean;
    stripeApiKey?: string;
    name: string;
    privacyPolicyAccepted: boolean;
    email: string;
}
export enum ProductType {
    donation = "donation",
    product = "product"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    addProductsBulk(productsList: Array<Product>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteProduct(productId: string): Promise<void>;
    deleteUser(user: Principal): Promise<void>;
    deleteUserProfile(user: Principal): Promise<void>;
    getAllArtists(): Promise<Array<ArtistProfile>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllProductsForArtist(artistId: string): Promise<Array<Product>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getArtist(artistId: string): Promise<ArtistProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPlatformCommissionRate(): Promise<bigint>;
    getProduct(productId: string): Promise<Product | null>;
    getProductsFiltered(artistId: string): Promise<Array<Product>>;
    getStoreSettings(artistId: string): Promise<StoreSettings | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    processSplitPayment(item: ShoppingItem, artistId: string, buyerId: Principal): Promise<void>;
    registerArtist(profile: ArtistProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdminStripeAccountId(accountId: string): Promise<void>;
    setPlatformCommissionRate(newRate: bigint): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProduct(product: Product): Promise<void>;
    updateStoreSettings(artistId: string, storeName: string, storeBio: string, bannerImage: ExternalBlob | null, socialLinks: SocialLinks): Promise<void>;
}
