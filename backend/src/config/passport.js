const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { User } = require('../models/User');
const bcrypt = require('bcryptjs');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('🔍 Debug: Checking Google OAuth credentials...');
console.log('🔍 GOOGLE_CLIENT_ID:', googleClientId ? '✅ Set' : '❌ Not set');
console.log('🔍 GOOGLE_CLIENT_SECRET:', googleClientSecret ? '✅ Set' : '❌ Not set');

if (!googleClientId || !googleClientSecret) {
  console.warn('⚠️  Google OAuth credentials not found. Google OAuth will be disabled.');
  console.warn('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
} else {
  console.log('✅ Google OAuth credentials found. Initializing Google Strategy...');
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: '/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            return done(null, user);
          }

          const newUser = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            passwordHash: await bcrypt.hash(Math.random().toString(36), 10), 
            language: 'en',
            role: 'user',
            subscriptionPlan: 'Free',
            googleId: profile.id
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
