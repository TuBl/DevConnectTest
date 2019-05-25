const express = require("express");
const router = express.Router();
//middleware
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");
//Models
const Post = require("../../models/Posts");
const Profile = require("../../models/Profile");
const User = require("../../models/Users");

//@route    POST api/posts
//@desc     Create post
//@access   Private , must be logged in to create post
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //remember we are logged in so we can find by id thanks to the token
      const user = await User.findById(req.user.id).select("-password");
      const newPost = Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//@route    GET api/posts
//@desc     GET all posts
//@access   Private

router.get("/", auth, async (req, res) => {
  try {
    //sort date: -1 sorts by most recent
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@route    GET api/posts/:id
//@desc     GET post by id
//@access   Private

router.get("/:id", auth, async (req, res) => {
  try {
    //sort date: -1 sorts by most recent
    const post = await Post.findById(req.params.id);
    if (!post) {
      //if they enter VALID OBJECTID (post id)that doesnt exist
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    // to avoid them receiving server error when entering INVALID OBJECTID (postID), keeping it vague more secure
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@route    DELETE api/posts/:id
//@desc     Delete a post
//@access   Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //We have to make sure that the user the wants to delete the post is the OWNER of the post
    //Check user; reminder post.user is an ObjectID so we have to change it to string
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authrized" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@route    PUT api/posts/like/:id
//@desc     Like a post
//@access   Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Check if post has already been liked by this user
    //if length > 0 means there is already something in the array for that user = post has already been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    //save it to DB
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    PUT api/posts/unlike/:id
//@desc     Unlike a post
//@access   Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Check if post has already been liked by this user
    //if length === 0 means we didn't like the post yet
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }
    //Get remove index.. to remove like from array
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    //save it to DB
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    POST api/posts/comment/:id
//@desc     Comment on a post
//@access   Private , must be logged in to create post
router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //remember we are logged in so we can find by id thanks to the token
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//          first need to find post id, then the comment id
//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Comment on a post
//@access   Private , must be logged in to create post

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Pull out comment from post
    //Gives us either the comment if it exists or false..
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ msg: "Comment doesn't exist" });
    }

    // Check if user is the owner of the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    //Get remove index.. to remove like from array
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    //save it to DB
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
