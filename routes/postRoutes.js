const express       = require('express');
const app           = express();
const router        = express.Router();
const bodyParser    = require('body-parser');
const bcrypt        = require('bcrypt');
const User = require('../schemas/UserSchema');
const jwt           = require("jsonwebtoken");

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/:id', (req, res, next) => {
    var user = jwt.decode(req.session.user)
    var payload = {
        pageTitle: "Visualizando postagem",
        userLoggedIn: user.user,
        userLoggedInJs: JSON.stringify(user.user),
        postId: req.params.id

    }
    res.status(200).render('postPage', payload);
});

module.exports = router;
