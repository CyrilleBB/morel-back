const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transport = {
    host: 'smtp.gmail.com',
    auth: {
        user: 'lafermedemonsieurmorel@gmail.com',
        pass: 'monsieurMorel!'
    }
}

const transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log('server is ready to take messages')
    }
})

const {signup, signin, signout, requireSignin} =  require('../controllers/auth');
const {signupValidation} = require('../service/signupValidation');

router.post('/signup', signupValidation, signup)
router.post('/signin', signin);
router.get('/signout', signout);
//TODO réorganiser cette route et la fonction
router.post('/mail', (req, res, next) => {

    const mail = {
        from: req.body.name,
        to: 'lafermedemonsieurmorel@gmail.com',
        subject: req.body.obj,
        text: `name: ${req.body.name} \n email: ${req.body.email} \n téléphone: ${req.body.tel} \n message: ${req.body.message} `
    }

    transporter.sendMail(mail, (err, data) => {
        if (err) {
            res.json({
              msg: 'fail'
            })
          } else {
            res.json({
              msg: 'success'
            })
          }
    })
})

module.exports = router;
