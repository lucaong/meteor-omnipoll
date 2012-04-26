// Template.omnipoll

Template.omnipoll.selected_polls = [];
Session.set("selected_poll_id", null);

Template.omnipoll.no_poll_selected = function() {
  return Session.equals("selected_poll_id", null)
}

Template.omnipoll.events = {
  'keyup .new_poll_text, click .new_poll_button': function(evt) {
    var code = (evt.keyCode ? evt.keyCode : evt.which),
        text = $(".new_poll_text").val(),
        createPollForAuthor = function(author) {
          Meteor.call('createPoll', {author: author["id"], text: text}, function(error, id) {
            Template.omnipoll.selected_polls = Polls.find({"_id": id});
            OmniPoll.router.setPoll(id);
          });
        };
    if(text && text.length > 0 && (evt.type === 'click' || evt.keyCode === 13 || evt.which === 13)) {
      OmniPoll.identifyUser(createPollForAuthor);
    }
  }
};


// Template.poll

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
      text = $(".new_option_text").val();
    if(text && text.length > 0 && (evt.type === 'click' || evt.keyCode === 13 || evt.which === 13)) {
      Meteor.call('createOption', {
        poll_id: this._id,
        text: text
      }, function(error, id) {
        $(".new_option_text").val("");
      });
    }
  },

  'click .share_poll_link': function(evt) {
    var self = this,
        pollURL = window.location.href,
        fb_share_object = {
          name: 'OmniPoll - ' + self.text,
          link: pollURL,
          caption: 'OmniPoll - Collect opinion in minutes.',
          description: ''
        };
    $("#share-dialog").find("input[type=text]").val(pollURL).end().dialog({
      show: {effect: 'fade'},
      minWidth: 500,
      open: function() { $("input#poll_url").select(); },
      buttons: {
        "Send link in Facebook message": function(){
          $(this).dialog("close");
          fb_share_object.method = 'send';
          FB.ui(fb_share_object, function(response) {
            if (response && response.post_id) {
              console.log('Poll was sent with facebook message.');
            } else {
              console.log('Poll was not sent with facebook message.');
            }
          });
        },
        "Post link on Facebook wall": function(){
          $(this).dialog("close");
          fb_share_object.method = 'feed';
          FB.ui(fb_share_object, function(response) {
            if (response && response.post_id) {
              console.log('Poll was published on facebook wall.');
            } else {
              console.log('Poll was not published on facebook wall.');
            }
          });
        }
      }
    });
    evt.preventDefault();
  }
};


// Template.option

Template.option.voters = function() {
  return Users.find({uid: {$in: this.voters}}, {sort: {name: 1}});
}

Template.option.votes_are = function(n) {
  return Options.findOne({_id: this._id}).votes === n;
}

Template.option.events = {
  'click': function(evt) {
    var self = this,
      vote = function(voter) {
        var voter_uid = voter["id"];
        Meteor.call("vote", self._id, voter_uid, function(error, result) {
          // Create or update user (upsert is not available in this MiniMongo version...)
          var user = Users.findOne({uid: voter_uid});
          $("#option_"+self._id).effect("highlight", {duration: 1000});
          if (user) {
            if (user.name !== voter.name) {
              Meteor.call("updateUser", user._id, {name: voter.name})
            }
          } else {
            Meteor.call("createUser", {uid: voter_uid, name: voter.name});
          }
        });
      };
    OmniPoll.identifyUser(vote);
  }
};


// Handlebar helpers

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