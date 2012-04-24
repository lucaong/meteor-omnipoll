Polls = new Meteor.Collection("polls");
Options = new Meteor.Collection("options");

if(!console) {
  console = {
    log: function(){}
  }
}

if (Meteor.is_client) {
  Meteor.autosubscribe(function() {
    var selected_poll_id = Session.get("selected_poll_id");
    if (selected_poll_id) {
      Meteor.subscribe("polls", selected_poll_id);
      Meteor.subscribe("options", selected_poll_id);
    }
  });

  Template.omnipoll.selected_polls = [];
  Session.set("selected_poll_id", null);

  Template.omnipoll.no_poll_selected = function() {
    return Session.equals("selected_poll_id", null)
  }

  Template.omnipoll.events = {
    'keyup .new_poll_text, click .new_poll_button': function(evt) {
      var code = (evt.keyCode ? evt.keyCode : evt.which),
        text, id;
      text = $(".new_poll_text").val();
      if(text && text.length > 0 && (evt.type === 'click' || evt.keyCode === 13 || evt.which === 13)) {
        console.log("New poll: "+text);
        id = Polls.insert({
          text: text,
          options: []
        });
        Template.omnipoll.selected_polls = Polls.find({"_id": id});
        Router.setPoll(id);
      }
    }
  };

  Template.poll.options = function() {
    return Options.find({poll_id: this._id}, {sort: {votes: -1, text: 1}});
  };

  Template.poll.no_option = function() {
    return Options.find({poll_id: this._id}, {sort: {votes: -1, text: 1}}).count() === 0;
  };

  Template.poll.events = {
    'keyup .new_option_text, click .new_option_button': function(evt) {
      var code = (evt.keyCode ? evt.keyCode : evt.which),
        text = $(".new_option_text").val(),
        id;
      if(text && text.length > 0 && (evt.type === 'click' || evt.keyCode === 13 || evt.which === 13)) {
        console.log("new option: "+text);
        id = Options.insert({
          poll_id: this._id,
          text: text,
          votes: 0
        });
        $(".new_option_text").val("");
      }
    },

    'click .share_poll_link': function(evt) {
      prompt("Copy and share this URL:", window.location.href);
      evt.preventDefault();
    }
  };

  Template.option.events = {
    'click': function(evt) {
      console.log("new vote");
      if(previously_voted_option_id = amplify.store("vote_"+this.poll_id)) {
        Options.update({"_id": previously_voted_option_id}, {
          $inc: {votes: -1}
        });
      }
      Options.update({"_id": this._id}, {
        $inc: {votes: 1}
      });
      amplify.store("vote_"+this.poll_id, this._id);
    }
  };

  ////////// Tracking selected poll in URL //////////

  var OmniPollRouter = Backbone.Router.extend({
    routes: {
      ":poll_id": "main"
    },
    main: function(poll_id) {
      console.log("route: "+(poll_id||"/"));
      if(poll_id) {
        Template.omnipoll.selected_polls = Polls.find({"_id": poll_id});
        Session.set("selected_poll_id", poll_id)
      }
    },
    setPoll: function(poll_id) {
      this.navigate(poll_id, true);
      Session.set("selected_poll_id", poll_id)
    }
  });

  Router = new OmniPollRouter;

  Meteor.startup(function () {
    Backbone.history.start({pushState: true});
  });
}

if (Meteor.is_server) {
  Meteor.publish("polls", function(poll_id) {
    return Polls.find({_id: poll_id});
  });
  Meteor.publish("options", function(poll_id) {
    return Options.find({poll_id: poll_id});
  });

  Meteor.startup(function () {
    //
  });
}