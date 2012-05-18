if ( typeof OmniPoll === 'undefined' ) {
  var OmniPoll = {};
}

OmniPoll.getFacebookUser = function( access_token ) {
  var result = Meteor.http.get( "https://graph.facebook.com/me", { params: { access_token: access_token } } );
  if ( result.error ) {
    console.log("Error retrieving facebook user");
    return null;
  } else {
    return result.data || JSON.parse( result.content );
  }
};

OmniPoll.createOrUpdateUser = function( facebook_user ) {
  if ( facebook_user ) {
    var user = Users.findOne({ uid: facebook_user.id });
    if ( user ) {
      if ( user.name !== facebook_user.name ) {
        Users.update({ _id: user._id }, { name: facebook_user.name });
        console.log( "Updated user " + user._id );
        return user._id;
      }
      return true;
    } else {
      var id = Users.insert({ uid: facebook_user.id, name: facebook_user.name });
      console.log( "Added new user: " + id );
      return id;
    }
  } else {
    return false;
  }
};