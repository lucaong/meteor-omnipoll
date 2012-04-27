Meteor.methods({
  // Create a new poll, setting the author
  createPoll: function(text, access_token) {
    var facebook_user = OmniPoll.getFacebookUser(access_token),
        id;
    if (!facebook_user)
      throw new Meteor.Error(401, "No facebook user");
    if (text.trim().length === 0)
      throw new Meteor.Error(406, "Missing poll text");
    id = Polls.insert({
      text: text.trim(),
      author: facebook_user.id,
      options: []
    });
    console.log("New poll created: " + id);
    OmniPoll.createOrUpdateUser(facebook_user);
    return id;
  },
  // Create a new option
  createOption: function(option_attrs) {
    option_attrs = _.extend(_.pick(option_attrs, 'poll_id', 'text'), {votes: 0, voters: []});
    var id = Options.insert(option_attrs);
    console.log("New option created: " + id);
    return id;
  },
  // Vote an option, setting the voter
  vote: function(option_id, access_token) {
    var facebook_user = OmniPoll.getFacebookUser(access_token),
        option = Options.findOne({_id: option_id});
    if (!option)
      throw new Meteor.Error(404, "No option found with id " + option_id);
    if (!facebook_user)
      throw new Meteor.Error(401, "No facebook user");
    Options.update({poll_id: option.poll_id, voters: facebook_user.id}, {
      $pull: {voters: facebook_user.id}, $inc: {votes: -1}
    });
    console.log("Removed old vote, if existing");
    Options.update({"_id": option_id}, {
      $push: {voters: facebook_user.id}, $inc: {votes: 1}
    });
    console.log("Added new vote for uid " + facebook_user.id);
    OmniPoll.createOrUpdateUser(facebook_user);
    return facebook_user;
  }
});