var OmniPollRouter = Backbone.Router.extend({
  routes: {
    ":poll_id": "main"
  },
  main: function(poll_id) {
    console.log("route: "+(poll_id||"/"));
    if(poll_id) {
      Template.omnipoll.selected_polls = Polls.find({"_id": poll_id});
      Session.set("selected_poll_id", poll_id);
    } else {
      Session.set("selected_poll_id", null);
    }
  },
  setPoll: function(poll_id) {
    this.navigate(poll_id, true);
    Session.set("selected_poll_id", poll_id);
  }
});

if (typeof OmniPoll === 'undefined') {
  var OmniPoll = {};
}

OmniPoll.router = new OmniPollRouter;