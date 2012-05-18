Meteor.startup(function () {
  // Disable direct client-side access to insert, update and remove on collections
  _.each([ 'polls', 'options', 'users' ], function( collection ) {
    _.each([ 'insert', 'update', 'remove' ], function( method ) {
      Meteor.default_server.method_handlers[ '/' + collection + '/' + method ] = function() {};
    });
  });
});