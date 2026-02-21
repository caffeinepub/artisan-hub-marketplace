import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type ProductType = { #product; #donation };

  type OldProduct = {
    id : Text;
    artistId : Text;
    price : Nat;
    name : Text;
    description : Text;
    categoryName : Text;
  };

  type ArtistProfile = {
    id : Text;
    name : Text;
    email : Text;
    isActive : Bool;
    stripeAccountId : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : Text; bio : ?Text }>;
    artists : Map.Map<Text, ArtistProfile>;
    artistPrincipals : Map.Map<Principal, Text>;
    products : Map.Map<Text, OldProduct>;
    platformCommission : Nat;
    configuration : ?Stripe.StripeConfiguration;
  };

  type NewProduct = {
    id : Text;
    artistId : Text;
    price : Nat;
    name : Text;
    description : Text;
    categoryName : Text;
    productType : ProductType;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : Text; bio : ?Text }>;
    artists : Map.Map<Text, ArtistProfile>;
    artistPrincipals : Map.Map<Principal, Text>;
    products : Map.Map<Text, NewProduct>;
    platformCommission : Nat;
    stripeConfiguration : ?Stripe.StripeConfiguration;
    checkoutSessions : Map.Map<Text, Principal>;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<Text, OldProduct, NewProduct>(
      func(_id, product) {
        { product with productType = #product };
      }
    );
    {
      old with
      products = newProducts;
      stripeConfiguration = old.configuration;
      checkoutSessions = Map.empty<Text, Principal>();
    };
  };
};
