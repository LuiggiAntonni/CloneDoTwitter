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

router.get('/', async (req, res, next) => {
    var user = jwt.decode(req.session.user)

    var payload = await getPayload(user.user.username, user.user);
    res.status(200).render('profilePage', payload);
});

router.get('/:id', async (req, res, next) => {
    var user = jwt.decode(req.session.user)

    var payload = await getPayload(req.params.id, user.user);
    res.status(200).render('profilePage', payload);
});

router.get('/:id/replies', async (req, res, next) => {
    var user = jwt.decode(req.session.user)

    var payload = await getPayload(req.params.id, user.user);
    payload.selectedTab = "replies";
    res.status(200).render('profilePage', payload);
});

async function getPayload(username, userLoggedIn) {
    var user = await User.findOne({ username: username})

    if (user == null) {
        
        user = await User.findById(username).catch(() => {
        });

        if (user == null) {
            return {
                pageTitle: "Usuario nao encontrado",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }

    }

    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }

}

module.exports = router;
