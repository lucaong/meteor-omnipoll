var Polls = new Meteor.Collection("polls"),
    Options = new Meteor.Collection("options"),
    Users = new Meteor.Collection("users"),
    OmniPoll = {};

if(!console) {
  console = {
    log: function(){}
  }
}

if (Meteor.is_client) {
  Meteor.subscribe("users");

  Meteor.autosubscribe(function() {
    var selected_poll_id = Session.get("selected_poll_id"),
      voters = [];
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
          text = $(".new_poll_text").val(),
          createPoll = function(author){
            var id;
            id = Polls.insert({
              text: text,
              options: [],
              author: author["id"]
            });
            console.log("New poll created: "+text);
            Template.omnipoll.selected_polls = Polls.find({"_id": id});
            Router.setPoll(id);
          };
      if(text && text.length > 0 && (evt.type === 'click' || evt.keyCode === 13 || evt.which === 13)) {
        OmniPoll.identifyUser(createPoll);
      }
    }
  };

  Template.poll.options = function() {
    return Options.find({poll_id: this._id}, {sort: {votes: -1, text: 1}});
  };

  Template.poll.author = function() {
    var author = Users.findOne({uid: this.author});
    return author ? author.name : "anonymous";
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
          votes: 0,
          voters: []
        });
        $(".new_option_text").val("");
      }
    },

    'click .share_poll_link': function(evt) {
      prompt("Copy and share this URL:", window.location.href);
      evt.preventDefault();
    }
  };

  Template.option.voters = function() {
    return Users.find({uid: {$in: this.voters}}, {sort: {name: 1}});
  }

  Template.option.events = {
    'click': function(evt) {
      var self = this,
        vote = function(voter) {
          var uid = voter["id"],
              user;
          Options.update({voters: uid}, {
            $pull: {voters: uid}, $inc: {votes: -1}
          });
          console.log("removed old vote");
          Options.update({"_id": self._id}, {
            $push: {voters: uid}, $inc: {votes: 1}
          });
          console.log("added new vote");
          // Create or update user (upsert is not available in this MiniMongo version...)
          user = Users.findOne({uid: voter["id"]});
          if (user) {
            if (user.name !== voter["name"]) {
              Users.update({uid: voter["id"]}, {name: voter["name"]});
              console.log("updated user");
            }
          } else {
            Users.insert({uid: voter["id"], name: voter["name"]});
            console.log("added new user");
          }
        };
      OmniPoll.identifyUser(vote);
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

    // Load the Facebook SDK Asynchronously
    (function(d){
      var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement('script'); js.id = id; js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      ref.parentNode.insertBefore(js, ref);
    }(document));

    // Init the SDK upon load
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '233897373383987', // App ID
        channelUrl : '//'+window.location.hostname+'/channel.txt', // Path to your Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
      });
    };

    OmniPoll.identifyUser = function(callback) {
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          FB.api('/me', function(response) {          
            callback(response);
          });
        } else {
          // Login with facebook
          FB.login(function(response) {
            if (response.authResponse) {
              console.log('User identified: '+response["id"]+" - "+response["name"]);
              OmniPoll.identifyUser(callback);
            } else {
              console.log('User cancelled login or did not fully authorize.');
            }
          });
        }
      });
    }

    Handlebars.registerHelper('to_sentence', function(items, options) {
      var out = "";
      items = items.fetch();
      for(var i=0; i<items.length; i++) {
        if(i === 0) {
          out += options.fn(items[i]);
        } else if (i === items.length - 1) {
          out += " and " + options.fn(items[i]);
        } else {
          out += ", " + options.fn(items[i]);
        }
      }
      return out;
    });
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

  Meteor.startup(function () {
    //
  });
}