const express       = require('express');
const app           = express();
const router        = express.Router();
const bodyParser    = require('body-parser');
const bcrypt        = require('bcrypt');
const User = require('../schemas/UserSchema');

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res, next) => {
    res.status(200).render('register');
});

router.post('/', async (req, res, next) => {
    
    var firstName   = req.body.firstName.trim();
    var lastName    = req.body.lastName.trim();
    var username    = req.body.username.trim();
    var email       = req.body.email.trim();
    var password    = req.body.password;

    var payload = req.body;

    if(firstName && lastName && username && email && password){
        var user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        .catch((err) => {
            console.log(err);
            payload.errorMessage = "Algo deu errado"
            res.status(500).render('register', payload);
        });

        if(user == null) {
            // usuário não encontrado
            var data = req.body;

            data.password = await bcrypt.hash(password, 10);

            User.create(data)
            .then((user) => {
                console.log(user);
            })
        }
        else {
            // usuário encontrado
            if(email == user.email) {
                payload.errorMessage = "Email " + email + " em uso"
            }
            else {
                if(username == user.username) {
                    payload.errorMessage = "Usuário " + username+ " em uso"
                }
                else {
                    payload.errorMessage = "Erro ao cadastrar"
                }
            }
            res.status(500).render('register', payload);
        }
    }
    else {
        payload.errorMessage = "Confira se todos os dados foram preenchidos corretamente"
        res.status(500).render('register', payload);
    }
});

module.exports = router;
