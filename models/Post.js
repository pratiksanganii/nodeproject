const { ObjectId } = require("mongodb");
const User = require("./User");
const sanitizeHTML = require("sanitize-html");

const postsCollection = require("../db")
  .db("NodePlayground")
  .collection("posts");

const Post = function (data, userId, requestedPostId) {
  this.data = data;
  this.errors = [];
  this.userId = userId;
  this.requestedPostId = requestedPostId;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title !== "string") {
    this.data.title = "";
  }
  if (typeof this.data.body !== "string") {
    this.data.body = "";
  }

  // get rid of any bogus property
  this.data = {
    title: sanitizeHTML(this.data.title.trim(), {
      allowedTags: [],
      allowedAttributes: [],
    }),
    body: sanitizeHTML(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: [],
    }),
    createdDate: new Date(),
    author: new ObjectId(this.userId),
  };
};

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("You must provide a post title.");
  }
  if (this.data.body == "") {
    this.errors.push("You must provide a post content.");
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      // save post into database
      postsCollection
        .insertOne(this.data)
        .then((info) => {
          resolve(info.insertedId);
        })
        .catch(() => {
          this.errors.push("Please try again later.");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

Post.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userId);

      if (post.isVisitorOwner) {
        // Actually update the db
        let status = await this.actuallyUpdate();
        resolve(status);
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.delete = function (postId, visitorId) {
  return new Promise(async (resolve, reject) => {
    try {
      const post = await Post.findSingleById(postId, visitorId);
      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({ _id: new ObjectId(postId) });
        resolve()
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      await postsCollection.updateOne(
        { _id: new ObjectId(this.requestedPostId) },
        {
          $set: {
            title: this.data.title,
            body: this.data.body,
          },
        }
      );
      resolve("success");
    } else {
      reject("failure");
    }
  });
};

Post.reusablePostQuery = function (uniqueOperations, visitorId) {
  return new Promise(async function (resolve, reject) {
    let aggOpertaions = uniqueOperations.concat([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDocument",
        },
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          authorId: "$author",
          author: { $arrayElemAt: ["$authorDocument", 0] },
        },
      },
    ]);
    let posts = await postsCollection.aggregate(aggOpertaions).toArray();

    // clean up author property in each post object
    posts = posts.map((post) => {
      post.isVisitorOwner = post.authorId.equals(new ObjectId(visitorId));
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      };
      return post;
    });
    resolve(posts);
  });
};

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    { $match: { author: new ObjectId(authorId) } },
    { $sort: { createdDate: -1 } },
  ]);
};

Post.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectId.isValid(id)) {
      reject();
      return;
    }

    let posts = await Post.reusablePostQuery(
      [{ $match: { _id: new ObjectId(id) } }, { $sort: { createdDate: -1 } }],
      visitorId
    );

    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

module.exports = Post;
