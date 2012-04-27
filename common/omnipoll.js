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

  Meteor.autosubscribe(function() {
    // Subscribe to selected poll and its options
    var selected_poll_id = Session.get("selected_poll_id");
    if (selected_poll_id) {
      Meteor.subscribe("polls", selected_poll_id);
      Meteor.subscribe("options", selected_poll_id);
    }
  });

  Meteor.autosubscribe(function() {
    // Subscribe to author of the selected poll
    var selected_poll = Polls.findOne({_id: Session.get("selected_poll_id")});
    if (selected_poll && selected_poll.author)
      Meteor.subscribe("users", [selected_poll.author]);
  });

  Meteor.autosubscribe(function() {
    // Subscribe to voters of the selected poll
    var voters = [];
    Options.find({poll_id: Session.get("selected_poll_id")}).forEach(function(opt) {
      voters = voters.concat(opt.voters);
    });
    Meteor.subscribe("users", voters);
  });
}

if (Meteor.is_server) {
  Meteor.publish("polls", function(poll_id) {
    return Polls.find({_id: poll_id});
  });
  Meteor.publish("users", function(user_list) {
    return Users.find({uid: {$in: user_list}});
  });
  Meteor.publish("options", function(poll_id) {
    return Options.find({poll_id: poll_id});
  });
}
