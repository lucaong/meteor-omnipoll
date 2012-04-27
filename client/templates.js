// Template.omnipoll

Template.omnipoll.selected_polls = [];
Session.set("selected_poll_id", null);

Template.omnipoll.no_poll_selected = function() {
  return Session.equals("selected_poll_id", null)
}

Template.omnipoll.events = {
  'keyup .new_poll_text, click .new_poll_button': function(evt) {
    var code = (evt.keyCode ? evt.keyCode : evt.which),
        text = $(".new_poll_text").val();
    if(text && $.trim(text).length > 0 && (evt.type === 'click' || evt.keyCode === 13 || evt.which === 13)) {
      $(".new_poll_text").attr("disabled", "disabled");
      OmniPoll.getAccessTokenAndCall(function(access_token) {
        Meteor.call('createPoll', text, access_token, function(error, id) {
          Template.omnipoll.selected_polls = Polls.find({"_id": id});
          OmniPoll.router.setPoll(id);
        });
      });
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
    if(text && $.trim(text).length > 0 && (evt.type === 'click' || evt.keyCode === 13 || evt.which === 13)) {
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
        to_share = {
          name: 'Poll: ' + self.text,
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
          OmniPoll.facebookShareDialog(to_share, "send");
        },
        "Post link on Facebook wall": function(){
          $(this).dialog("close");
          OmniPoll.facebookShareDialog(to_share, "feed");
        }
      }
    });
    evt.preventDefault();
  }
};


// Template.option

Template.option.voters_to_sentence = function() {
  var voters = Users.find({uid: {$in: this.voters}}, {sort: {name: 1}}).fetch(),
      out = "";
  for(var i=0; i<voters.length; i++) {
    if(i === 0) {
      out += voters[i].name;
    } else if (i === voters.length - 1) {
      out += " and " + voters[i].name;
    } else {
      out += ", " + voters[i].name;
    }
  }
  return out;
}

Template.option.one_vote = function() {
  return Options.findOne({_id: this._id}).votes === 1;
}

Template.option.events = {
  'click': function(evt) {
    var self = this;
    OmniPoll.getAccessTokenAndCall(function(voter_access_token) {
      Meteor.call("vote", self._id, voter_access_token, function(error, voter) {
        if(!error) {
          $("#option_"+self._id).effect("highlight", {duration: 1000});
        }
      });
    });
  }
};

