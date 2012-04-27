if (typeof OmniPoll === 'undefined') {
  var OmniPoll = {};
}

// Authenticate the user with facebook and execute the callback passing the access_token
OmniPoll.getAccessTokenAndCall = function(callback) {
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      console.log('User was already logged');
      callback(response.authResponse.accessToken);
    } else {
      // Login with facebook
      FB.login(function(response) {
        if (response.authResponse && response.authResponse.accessToken) {
          console.log('User logged');
          callback(response.authResponse.accessToken);
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      });
    }
  });
};

// Open facebook dialog to share poll on wall or send via private message
OmniPoll.facebookShareDialog = function(to_share, method) {
  to_share.method = method;
  FB.ui(to_share, function(response) {
    if (response && response.post_id) {
      console.log('Poll was shared on facebook with method ' + method);
    } else {
      console.log('Poll was NOT shared on facebook with method ' + method);
    }
  });
}