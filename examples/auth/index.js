var carcass = require('carcass');
require('carcass-auth');
// require('carcass-memoray');
var LocalStrategy = require('passport-local').Strategy;

// Register applications.
carcass.register(__dirname, 'applications');

// Register models.
carcass.register(__dirname, 'models');

// Generate some fake data
var User = carcass.models.user;

var user = new User({
    id: 'root',
    password: 'test'
});

User.hashPassword(user, function(data) {
    console.log(data.message);
    user.save(function() {
        console.log('save success and the hashed password is ' + user.attrs.password);
    });
});

// init a server
var server = new carcass.servers.Http();

var passport = carcass.factories.Passport();

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
    
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
    
passport.use('local', new LocalStrategy({
    usernameField:     'id',
    passwordField:     'password',
    passReqToCallback: false
}, function(username, password, done) {
    User.verifyPassword(username, password, function(err, user) {
      if (err) return done(err, null);
      return done(null, user);
    });
}));

server.mount('applications/cors');
server.mount('applications/restify');
server.mount('applications/session');

server.mount('passport', {
  passport: passport
});

server.mount('passportSession', {
  passport: passport
});

server.mount('applications/login', {
  passport: passport
});

server.start(function() {
    console.log('server started at http://localhost:3000');
});
