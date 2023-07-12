const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const User = require('../database/Models/user')

passport.use(new LocalStrategy (
    async(username, password, done) => {
        try {
            const user = await User.findOne({where:{username}})
            if(!user){
                return done(null, false, {message: "User Not found!"})
            }
            const validUser = await bcrypt.compare(password, user.password)
            if(!validUser){
                return done(null, false, {message: "Invalid password"})
            }
            return done(null,user)
        } catch (error) {
            done(error)
        }
    }
))

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    User.findByPk(id).then((user)=> {
        done(null,user)
    }).catch((error)=> {
        done(error)
    })
})

module.exports = passport
