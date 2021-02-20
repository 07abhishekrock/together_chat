const GoogleStrategy = require('passport-google-oauth20').Strategy;

function initialize(passport,getUserById,addUser){
    passport.use(new GoogleStrategy({
        clientID: "796472237244-3s2osgdllfvgkrp089ts58e804725ufl.apps.googleusercontent.com",
        clientSecret: "U9G-uJvYcPQ1LGgGobCH6hYv",
        callbackURL:"http://localhost:8080/auth/google/callback"
    },
    
    async function(accessToken, refreshToken, profile, done){
        user = {id:profile.id, email:profile.emails[0].value, photo:profile.photos[0].value, username:'User 101', age:'20', motto:'my status is cool',first_time:true};
        await addUser(user);
        done(null,user);
    })
    )

    passport.serializeUser((user,done)=>{
        done(null,user.id);
    }
    );
    passport.deserializeUser(async (id,done)=>{
        user =  await getUserById(id);
        done(null,user);
    })
}

module.exports = initialize;