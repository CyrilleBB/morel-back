const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

exports.signup = (req, res) => {
    console.log('req.body', req.body);
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err
            })
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    });
};

exports.signin = (req, res) => {
    const {email, password} = req.body;
    User.findOne({email}, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Pas d\'utilisateur avec ce courriel. Inscrivez-vous!'
            });
        }

        if(!user.authenticate(password)) {
            return res.status(401).json({
                error: "Le mot de passe ne correspond pas"
            })
        }

        const token = jwt.sign({ _id: user._id}, process.env.JWT_SECRET);

        res.cookie('t', token, {expire: new Date() + 3600});

        const {_id, name, email, role} = user
        return res.json({token, user: {_id, email, name, role}})

    });
};

exports.signout = (req, res) => {
    res.clearCookie('t')
    // TODO préférer req.session.destroy(), plus sûr
    // le mettre dans la request logout puisque c'est une requête
    // req.session.destroy(function(err){
    //     if(err){
    //        console.log(err);
    //     }else{
    //         console.log(session.email);
    //         req.end();
    //         res.redirect('/signup');
    //     }
    //  });
    res.json({message: 'Déconnection'})
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id // req.auth._id: string
        console.log('req.profile', req.profile, 'req.auth', req.auth)
        if(!user) {
            return res.status(403).json({
                error: 'Accès non authorisé'
            });
        }

        next();
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Accès non authorisé"
        })
    }
    next();
}
