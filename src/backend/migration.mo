import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old type without legal acceptance fields
  type OldUserProfile = {
    name : Text;
    email : Text;
    bio : ?Text;
    stripeApiKey : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New type with legal acceptance fields
  type NewUserProfile = {
    name : Text;
    email : Text;
    bio : ?Text;
    stripeApiKey : ?Text;
    termsAccepted : Bool;
    privacyPolicyAccepted : Bool;
  };

  // New actor type
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          oldProfile with
          termsAccepted = false;
          privacyPolicyAccepted = false;
        };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
