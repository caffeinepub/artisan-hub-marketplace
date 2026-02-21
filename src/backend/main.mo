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
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Text "mo:core/Text";

// Specify the data migration function in with-clause
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
    stripeApiKey : ?Text;
  };

  var userProfiles = Map.empty<Principal, UserProfile>();

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

  var artistProfiles = Map.empty<Text, ArtistProfile>();
  var artistPrincipals = Map.empty<Principal, Text>();

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
    artistProfiles.add(profile.id, { profile with isActive = true });
  };

  public query ({ caller }) func getArtist(artistId : Text) : async ?ArtistProfile {
    artistProfiles.get(artistId);
  };

  public query ({ caller }) func getAllArtists() : async [ArtistProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all artists");
    };
    artistProfiles.values().toArray();
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
    imageUrls : [Text];
    videoUrl : ?Text;
  };

  var products = Map.empty<Text, Product>();

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

  var storeSettings = Map.empty<Text, StoreSettings>();

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
  public type CommissionSplit = {
    artistShareCents : Nat;
    adminShareCents : Nat;
  };

  // Platform administrator's Stripe Account ID for receiving commissions
  var adminStripeAccountId : ?Text = null;

  public shared ({ caller }) func setAdminStripeAccountId(accountId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set the account ID");
    };
    adminStripeAccountId := ?accountId;
  };

  func splitCommission(totalAmountCents : Nat, commissionRate : Nat) : CommissionSplit {
    let adminShareCents = totalAmountCents * commissionRate / 100;
    let artistShareCents = totalAmountCents - adminShareCents;
    {
      artistShareCents;
      adminShareCents;
    };
  };

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  var checkoutSessions = Map.empty<Text, Principal>();

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check Stripe configuration");
    };
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    validateStripeSetupInternal(items);
    let sessionId = await Stripe.createCheckoutSession(
      getStripeConfiguration(),
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
      getStripeConfiguration(),
      sessionId,
      transform,
    );
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func processSplitPayment(item : Stripe.ShoppingItem, artistId : Text, buyerId : Principal) : async () {
    // Only admins can process split payments (platform backend operation)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can process split payments");
    };

    let commission = splitCommission(item.priceInCents, platformCommission);
    let artistShare = Nat64.fromNat(commission.artistShareCents);
    let adminShare = Nat64.fromNat(commission.adminShareCents);

    // Validate payment setup
    switch (adminStripeAccountId) {
      case (null) {
        Runtime.trap("Admin Stripe payment details missing. Please contact support.");
      };
      case (?adminAccountId) {
        switch (artistProfiles.get(artistId)) {
          case (null) {
            Runtime.trap("Artist not found. Please try again or contact support.");
          };
          case (?artist) {
            switch (artist.stripeAccountId) {
              case (null) {
                Runtime.trap("Artist Stripe payment details missing. Please contact support.");
              };
              case (?artistAccountId) {
                // Payment processing logic would go here
                // This is a placeholder for actual Stripe API calls
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllProductsForArtist(artistId : Text) : async [Product] {
    // Public query - anyone can view products for an artist
    products.values().toArray().filter(
      func(product) { product.artistId == artistId }
    );
  };

  // Internal validation function (not exposed as public)
  func validateStripeSetupInternal(items : [Stripe.ShoppingItem]) {
    if (items.size() == 0) {
      Runtime.trap("No items provided");
    };
    
    // Check admin Stripe setup
    switch (adminStripeAccountId) {
      case (null) {
        Runtime.trap("Missing admin Stripe payment details. Please contact support.");
      };
      case (?_accountId) {};
    };

    // Check artist Stripe setup for each item
    for (item in items.values()) {
      // Extract artistId from item metadata or product lookup
      // Assuming the item has a productId that we can look up
      let productId = item.productName; // Use productName as productId reference
      switch (products.get(productId)) {
        case (null) {
          Runtime.trap("Product not found: " # productId);
        };
        case (?product) {
          switch (artistProfiles.get(product.artistId)) {
            case (null) {
              Runtime.trap("Artist not found for product: " # productId);
            };
            case (?artist) {
              switch (artist.stripeAccountId) {
                case (null) {
                  Runtime.trap("Artist Stripe payment details missing for: " # artist.name # ". Please contact the artist.");
                };
                case (?_) {
                  // Artist has Stripe configured
                };
              };
            };
          };
        };
      };
    };
  };

  func getDefaultPrincipal() : Principal {
    Principal.fromText("2vxsx-fae");
  };
};
