Meteor.methods({
  createPoll: function(poll_attrs) {
    poll_attrs = _.extend(_.pick(poll_attrs, 'author', 'text'), {options: []});
    var id = Polls.insert(poll_attrs);
    console.log("New poll created: " + id);
    return id;
  },
  createOption: function(option_attrs) {
    option_attrs = _.extend(_.pick(option_attrs, 'poll_id', 'text'), {votes: 0, voters: []});
    var id = Options.insert(option_attrs);
    console.log("New option created: " + id);
    return id;
  },
  createUser: function(user_attrs) {
    var id = Users.insert(_.pick(user_attrs, 'uid', 'name'));
    console.log("Added new user: " + id);
    return id;
  },
  updateUser: function(user_id, user_attrs) {
    var id = Users.update({_id: user_id}, _.pick(user_attrs, 'name'));
    console.log("Updated user: " + id);
    return id;
  },
  vote: function(option_id, voter_uid) {
    console.log(option_id+" vote "+voter_uid)
    var option = Options.findOne({_id: option_id});
    if (!option) {
      throw "No option found with id " + option_id;
    }
    Options.update({poll_id: option.poll_id, voters: voter_uid}, {
      $pull: {voters: voter_uid}, $inc: {votes: -1}
    });
    console.log("Removed old vote, if existing");
    Options.update({"_id": option_id}, {
      $push: {voters: voter_uid}, $inc: {votes: 1}
    });
    console.log("Added new vote for uid " + voter_uid);
    return true;
  }
});