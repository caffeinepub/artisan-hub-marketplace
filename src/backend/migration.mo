import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    name : Text;
    email : Text;
    bio : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    name : Text;
    email : Text;
    bio : ?Text;
    stripeApiKey : ?Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let userProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, profile) {
        {
          profile with
          stripeApiKey = null;
        };
      }
    );
    { old with userProfiles };
  };
};
