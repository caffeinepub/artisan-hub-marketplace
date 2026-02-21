import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Storage
  include MixinStorage();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profiles
  public type UserProfile = {
    name : Text;
    email : Text;
    bio : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Artists
  public type ArtistProfile = {
    id : Text;
    name : Text;
    email : Text;
    isActive : Bool;
    stripeAccountId : ?Text;
  };

  let artists = Map.empty<Text, ArtistProfile>();
  let artistPrincipals = Map.empty<Principal, Text>();

  var platformCommission : Nat = 10;

  public query ({ caller }) func getPlatformCommissionRate() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view commission rate");
    };
    platformCommission;
  };

  public shared ({ caller }) func setPlatformCommissionRate(newRate : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    platformCommission := newRate;
  };

  public shared ({ caller }) func registerArtist(profile : ArtistProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register as artists");
    };
    artistPrincipals.add(caller, profile.id);
    artists.add(profile.id, { profile with isActive = true });
  };

  public query ({ caller }) func getArtist(artistId : Text) : async ?ArtistProfile {
    artists.get(artistId);
  };

  public query ({ caller }) func getAllArtists() : async [ArtistProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all artists");
    };
    artists.values().toArray();
  };

  // Product Types
  public type ProductType = {
    #product;
    #donation;
  };

  public type Product = {
    id : Text;
    artistId : Text;
    price : Nat;
    name : Text;
    description : Text;
    categoryName : Text;
    productType : ProductType;
  };

  let products = Map.empty<Text, Product>();

  public shared ({ caller }) func addProduct(product : Product) : async () {
    let isOwner = switch (artistPrincipals.get(caller)) {
      case (?id) { id == product.artistId };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only add products for your own artist account");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    let isOwner = switch (artistPrincipals.get(caller)) {
      case (?id) { id == product.artistId };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    switch (products.get(productId)) {
      case (?product) {
        let isOwner = switch (artistPrincipals.get(caller)) {
          case (?id) { id == product.artistId };
          case (null) { false };
        };
        if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own products");
        };
        products.remove(productId);
      };
      case (null) {
        Runtime.trap("Product does not exist");
      };
    };
  };

  public shared ({ caller }) func addProductsBulk(productsList : [Product]) : async () {
    if (productsList.size() == 0) {
      Runtime.trap("Product list cannot be empty");
    };
    let artistId = productsList[0].artistId;
    let isOwner : Bool = switch (artistPrincipals.get(caller)) {
      case (?id) { id == artistId };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only add products for your own artist account");
    };
    for (product in productsList.values()) {
      if (product.artistId != artistId) {
        Runtime.trap("All products must have the same artistId");
      };
      products.add(product.id, product);
    };
  };

  public query ({ caller }) func getProduct(productId : Text) : async ?Product {
    products.get(productId);
  };

  public query ({ caller }) func getProductsFiltered(artistId : Text) : async [Product] {
    let filtered = products.values().toArray().filter(
      func(product : Product) : Bool { product.artistId == artistId }
    );
    filtered;
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Store Settings
  public type StoreSettings = {
    storeName : Text;
    storeBio : Text;
    bannerImage : ?Storage.ExternalBlob;
    socialLinks : SocialLinks;
  };

  public type SocialLinks = {
    instagram : ?Text;
    facebook : ?Text;
    twitter : ?Text;
    tiktok : ?Text;
    youtube : ?Text;
  };

  let storeSettings = Map.empty<Text, StoreSettings>();

  public shared ({ caller }) func updateStoreSettings(artistId : Text, storeName : Text, storeBio : Text, bannerImage : ?Storage.ExternalBlob, socialLinks : SocialLinks) : async () {
    let isOwner = switch (artistPrincipals.get(caller)) {
      case (?id) { id == artistId };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own store settings");
    };
    storeSettings.add(artistId, {
      storeName;
      storeBio;
      bannerImage;
      socialLinks;
    });
  };

  public query ({ caller }) func getStoreSettings(artistId : Text) : async ?StoreSettings {
    storeSettings.get(artistId);
  };

  // Stripe Payments
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Track checkout sessions by creator
  let checkoutSessions = Map.empty<Text, Principal>();

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    let sessionId = await Stripe.createCheckoutSession(
      switch (stripeConfiguration) {
        case (null) { Runtime.trap("Stripe not configured") };
        case (?config) { config };
      },
      getDefaultPrincipal(),
      items,
      successUrl,
      cancelUrl,
      transform,
    );
    checkoutSessions.add(sessionId, caller);
    sessionId;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    let isOwner = switch (checkoutSessions.get(sessionId)) {
      case (?creator) { creator == caller };
      case (null) { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own checkout sessions");
    };
    await Stripe.getSessionStatus(
      switch (stripeConfiguration) {
        case (null) { Runtime.trap("Stripe not configured") };
        case (?config) { config };
      },
      sessionId,
      transform,
    );
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getDefaultPrincipal() : Principal {
    Principal.fromText("2vxsx-fae");
  };
};
