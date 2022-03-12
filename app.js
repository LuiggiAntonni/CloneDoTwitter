const express       = require('express');
const app           = express();
const port          = 3000;
const middleware    = require('./middleware')
const path          = require('path')
const bodyParser    = require('body-parser')
const mongoose      = require('./database')
const session       = require('express-session')
const jwt           = require('jsonwebtoken')

const server = app.listen(port, () => console.log('Server rodando na porta ' + port))

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}))

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', logoutRoute);

app.get('/', middleware.requireLogin,(req, res, next) => {
    var user = jwt.decode(req.session.user)
    var payload = {
        pageTitle: "Home",
        userLoggedIn: user.user
    }
    console.log(user)

    res.status(200).render('home', payload)
});
