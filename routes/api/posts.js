const express       = require('express');
const app           = express();
const router        = express.Router();
const bodyParser    = require('body-parser');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const jwt           = require("jsonwebtoken");

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res, next) => {
    Post.find()
    .populate("postedBy")
    .populate("retweetData")
    .sort({ "createdAt" : -1 })
    .then(async (results) => {
        results = await User.populate(results, { path: "retweetData.postedBy"})
        res.status(200).send(results);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
});

router.post('/', async (req, res, next) => {
    
    if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }
    var user = jwt.decode(req.session.user);

    var postData = {
        content: req.body.content,
        postedBy: user.user
    }

    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, { path: "postedBy"});

        res.status(201).send(newPost);
    })
    .catch((err) => {
        console.log(err);
        return res.sendStatus(400);
    })
});

router.put('/:id/like', async (req, res, next) => {
    
    var postId = req.params.id;
    var user = jwt.decode(req.session.user).user
    var userId = user._id;
    
    var isLiked = user.likes && user.likes.includes(postId); 

    var option = isLiked ? "$pull" : "$addToSet"
    
    // Insert user like
    user = await User.findByIdAndUpdate(userId, { [option]: {likes: postId} }, { new: true })
    .catch(error => {
        console.log(error);
        return res.sendStatus(400);
    })

    let token = jwt.sign({
        user: user
    }, process.env.JWT_KEY, {
        expiresIn: "1h"
    });
    req.session.user = token


    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: {likes: userId} }, { new: true })
    .catch(error => {
        console.log(error);
        return res.sendStatus(400);
    })


    res.status(200).send(post);
});

router.post('/:id/retweet', async (req, res, next) => {
    var postId = req.params.id;
    var user = jwt.decode(req.session.user).user
    var userId = user._id;
    
    // Try and delete retweet
    var deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId})
    .catch(error => {
        console.log(error);
        return res.sendStatus(400);
    })

    var option = deletedPost != null ? "$pull" : "$addToSet";

    var repost = deletedPost;

    if(repost == null) {
        repost = await Post.create({ postedBy: userId, retweetData: postId})
        .catch(error => {
            console.log(error);
            return res.sendStatus(400);
        })
    }
    
    // Insert user
    user = await User.findByIdAndUpdate(userId, { [option]: {retweets: repost._id} }, { new: true })
    .catch(error => {
        console.log(error);
        return res.sendStatus(400);
    })

    let token = jwt.sign({
        user: user
    }, process.env.JWT_KEY, {
        expiresIn: "1h"
    });
    req.session.user = token


    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: {retweetUsers: userId} }, { new: true })
    .catch(error => {
        console.log(error);
        return res.sendStatus(400);
    })


    res.status(200).send(post);
});

module.exports = router;
