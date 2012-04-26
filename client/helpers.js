if (typeof OmniPoll === 'undefined') {
  var OmniPoll = {};
}

OmniPoll.identifyUser = function(callback) {
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      FB.api('/me', function(response) {
        console.log('User identified: '+response["id"]+" - "+response["name"]);          
        callback(response);
      });
    } else {
      // Login with facebook
      FB.login(function(response) {
        if (response.authResponse) {
          console.log('User logged');
          OmniPoll.identifyUser(callback);
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      });
    }
  });
};