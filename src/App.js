import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { css } from "@emotion/css";
import Amplify, { Auth, DataStore, Storage, syncExpression } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Button from "./Button";
import CreatePost from "./CreatePost";
import Header from "./Header";
import { Post, PostStatus } from "./models";
import Posts from "./Posts";
import SinglePost from "./SinglePost";

DataStore.configure({
  syncExpressions: [
    syncExpression(Post, () => {
      return (post) => post.status("eq", PostStatus.ACTIVE);
    }),
  ],
});

function App() {
  /* create a couple of pieces of initial state */
  const [showOverlay, updateOverlayVisibility] = useState(false);
  const [posts, updatePosts] = useState([]);
  const [myPosts, updateMyPosts] = useState([]);

  /* fetch posts when component loads */
  useEffect(() => {
    async function fetchPosts() {
      /* check if user is logged in */
      let user = await Auth.currentAuthenticatedUser();
      Amplify.configure({
        aws_appsync_authenticationType:
          user != null ? "AMAZON_COGNITO_USER_POOLS" : "API_KEY",
      });

      /* query the API, ask for 100 items */
      let postData = await DataStore.query(Post);
      console.log("POST DATA FROM LOCAL: ");
      console.log(postData);
      let postsArray = postData;
      /* map over the image keys in the posts array, get signed image URLs for each image */
      postsArray = await Promise.all(
        postsArray.map(async (post) => {
          let copyPost = { ...post };
          if (copyPost.image != null) {
            const imageKey = await Storage.get(copyPost.image);
            copyPost.image = imageKey;
          }
          return copyPost;
        })
      );
      /* update the posts array in the local state */
      setPostState(postsArray);
    }

    fetchPosts();

    const subscription = DataStore.observe(Post).subscribe((msg) => {
      console.log(msg.model, msg.opType, msg.element);
      fetchPosts();
    });
    return () => subscription.unsubscribe();
  }, []);

  async function setPostState(postsArray) {
    const user = await Auth.currentAuthenticatedUser();
    const myPostData = postsArray.filter((p) => p.owner === user.username);
    updateMyPosts(myPostData);
    updatePosts(postsArray);
  }

  return (
    <>
      <HashRouter>
        <div className={contentStyle}>
          <Header />
          <hr className={dividerStyle} />
          <Button
            title="New Post"
            onClick={() => updateOverlayVisibility(true)}
          />
          <Routes>
            <Route exact path="/" element={<Posts posts={posts} />} />
            <Route path="/post/:id" element={<SinglePost />} />
            <Route exact path="/myposts" element={<Posts posts={myPosts} />} />
          </Routes>
        </div>
      </HashRouter>
      {showOverlay && (
        <CreatePost
          updateOverlayVisibility={updateOverlayVisibility}
          updatePosts={setPostState}
          posts={posts}
        />
      )}
    </>
  );
}

const dividerStyle = css`
  margin-top: 15px;
`;

const contentStyle = css`
  min-height: calc(100vh - 45px);
  padding: 0px 40px;
`;

export default withAuthenticator(App);
