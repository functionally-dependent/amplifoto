import { withAuthenticator } from "@aws-amplify/ui-react";
import { css } from "@emotion/css";
import React from "react";
import { Link } from "react-router-dom";
import Button from "./Button";

function Header({ signOut }) {
  return (
    <div className={headerContainer}>
      <h1 className={headerStyle}>Amplifoto</h1>
      <Link to="/" className={linkStyle}>
        All Posts
      </Link>
      <Link to="/myposts" className={linkStyle}>
        My Posts
      </Link>
      <Button onClick={signOut} title="Sign out" />
    </div>
  );
}

const headerContainer = css`
  padding: 20px;
  background-color: #e5e5df;
`;

const headerStyle = css`
  font-size: 40px;
  margin-top: 0px;
  font-family: "Amazon Ember", "Helvetica Neue", "Helvetica", "Arial",
    sans-serif;
`;

const linkStyle = css`
  color: black;
  font-weight: bold;
  text-decoration: none;
  margin-right: 20px;
  text-shadow: rgba(0, 0, 0, 0.01) 0 0 1px;
  \:hover {
    color: #058aff;
  }
`;

/*
const signoutStyle = css`
  display: inline-block;
  margin-left: 10vw;
  width: 100px;
  max-with: 20vw;
`;
*/

export default withAuthenticator(Header);
