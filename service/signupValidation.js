exports.signupValidation = (req, res, next) => {
    req.check('name', 'Un nom est requis').notEmpty();
    req.check('email', 'L\'email doit être entre 3 et 32 caractères')
        .isLength({
            min: 4,
            max: 32
        })
        .matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) //RFC 5322
        .withMessage('L\'email n\'a pas un format valable. Exemple d\'email valable "test@gmail.com"')
    req.check('password', 'Un mot de passe est requis').notEmpty()
    req.check('password')
        .isLength({min: 6})
        .withMessage('Le mot de passe doit avoir au moins 6 caractères')
        .matches(/\d/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre')
        const errors = req.validationErrors()
        if (errors) {
            const firstError = errors.map(error => error.msg)[0]
            return res.status(400).json({error: firstError});
        }
        next();
}
