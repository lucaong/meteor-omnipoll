var Polls = new Meteor.Collection("polls"),
    Options = new Meteor.Collection("options"),
    Users = new Meteor.Collection("users");

if (typeof OmniPoll === 'undefined') {
  var OmniPoll = {};
}

if (Meteor.is_client) {
  if(window && !window.console) {
    window.console = {
      log: function(){}
    }
  }

  Meteor.subscribe("users");

  Meteor.autosubscribe(function() {
    var selected_poll_id = Session.get("selected_poll_id"),
      voters = [];
    if (selected_poll_id) {
      Meteor.subscribe("polls", selected_poll_id);
      Meteor.subscribe("options", selected_poll_id);
    }
  });
}

if (Meteor.is_server) {
  Meteor.publish("polls", function(poll_id) {
    return Polls.find({_id: poll_id});
  });
  Meteor.publish("users", function() {
    return Users.find({});
  });
  Meteor.publish("options", function(poll_id) {
    return Options.find({poll_id: poll_id});
  });
}
