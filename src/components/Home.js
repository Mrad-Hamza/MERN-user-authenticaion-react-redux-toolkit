import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import UserService from "../services/user.service";

const Home = () => {
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [content, setContent] = useState([]);



  useEffect(() => {
    console.log(isLoggedIn)
    UserService.getAllUsers().then(
      (response) => {
        setContent(response.data);
        console.log(response.data)
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setContent(_content);
      }
    );
  }, []);


  function UserGreeting() {
    return content.map(function (user, index) {
      const username = Object.values(user)[7];
      const mailAddress = Object.values(user)[4];
      return <li> User name : <b>{username}</b>, Mail Address : <b>{mailAddress}</b> </li>
    });
  }

  function GuestGreeting() {
    return <h1>{content}, You Must Log In</h1>;
  }

  return (
    <div className="container">
      <h3>Users List : </h3>
      <header className="jumbotron">
        {isLoggedIn ? <UserGreeting /> : <GuestGreeting/>}
      </header>
    </div>
  );
};

export default Home;
