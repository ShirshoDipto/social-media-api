const mongoose = require("mongoose");
const Post = require("./models/post");
const Comment = require("./models/comment");
const Like = require("./models/like");
const Reply = require("./models/reply");
const User = require("./models/user");
// const Post = require("./models/post");
// const Post = require("./models/post");
require("dotenv").config();

mongoose.set("strictQuery", false);
const mongoDbUri = process.env.MONGODB_URI;

async function connectToMongoDb() {
  await mongoose.connect(mongoDbUri);
  console.log("Database connection successful!!");
}

async function testPostCreation() {
  const post = new Post({
    title: "Test",
    content: "test content",
    author: "6403019202a8f139409779e7",
    image: "test image",
  });

  const savedPost = await post.save();
  console.log(savedPost);
}

async function testCommentCreation() {
  const comment = new Comment({
    content: "test comment",
    postId: "642af591f13d399cb4e72ea8",
    author: "6403019202a8f139409779e7",
  });

  const savedComment = await comment.save();
  console.log(savedComment);
}

async function testReplyCreation() {
  const reply = new Reply({
    content: "test comment",
    commentId: "642af9579b80a1834396ea01",
    author: "6403019202a8f139409779e7",
  });

  const savedReply = await reply.save();
  console.log(savedReply);
}

async function testUserCreation() {
  try {
    const user = new User({
      firstName: "Mohammad",
      lastName: "Adhi",
      email: "moham@gmail.com",
      password: "princeton01",
      desc: "lorem ipsum",
    });
    console.log("something. ");
    const savedUser = await user.save();
    console.log(savedUser);
  } catch (err) {
    console.log(err);
  }
}

async function testLikeCreation() {
  const like = new Like({
    author: "642ba66fe8d28902c92f6cb9",
    referenceId: "642afa933c21fb3d711c76b9",
  });

  const savedLike = await like.save();
  console.log(savedLike);
}

async function createPosts() {
  for (let i = 0; i < 100; i++) {
    const post = new Post({
      title: `test post ${i}`,
      content: `test post content ${i}`,
      author: "642d37499567f4beb0bb06a1",
    });
    const savedPost = await post.save();
    console.log("post created. ");
  }
}

async function begin() {
  await connectToMongoDb();
  // await testPostCreation();
  // await testCommentCreation();
  // await testReplyCreation();
  // await testUserCreation();
  // await testLikeCreation();
  await createPosts();
}

begin();
