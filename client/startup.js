Meteor.startup(function () {
  Backbone.history.start({pushState: true});

  // Load the Facebook SDK Asynchronously
  (function(d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
  }(document));

  // Init the Facebook SDK upon load
  window.fbAsyncInit = function() {
    FB.init({
      appId      : FACEBOOK_APP_ID, // App ID
      channelUrl : '//'+window.location.hostname+'/channel.txt', // Path to your Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });
  };
});