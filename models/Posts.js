const mongoose = require("mongoose");
//so we can use Schema.something isntead of mongoose.Schema.something (eg Schema.Types....)
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    //reference the users model
    ref: "users"
  },
  text: {
    type: String,
    required: true
  },
  //user name not post name, to have the option to keep a post incase a user deletes their accont or something similar
  // another reason for having name/avatar is to have ease of access without having to dig into the user collection
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
      //to know likes came from which user and to limit 1 user: 1 like via user id
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Posts = mongoose.model("post", PostSchema);
