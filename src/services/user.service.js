import axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_API_URL + "/users/";

const getAllUsers = () => {
  const requestOptions = {
    method: "DELETE",
    headers: authHeader(),
    
  };
  console.log(API_URL)
  console.log(requestOptions)
  return axios.get(API_URL, requestOptions);
};

const deleteUser = (id) => {
  const requestOptions = {
    method: "DELETE",
    headers: authHeader(),
  };
  return axios.delete(API_URL + id, requestOptions)
}


// const getUserBoard = () => {
//   return axios.get(API_URL + "user", { headers: authHeader() });
// };

// const getModeratorBoard = () => {
//   return axios.get(API_URL + "mod", { headers: authHeader() });
// };

// const getAdminBoard = () => {
//   return axios.get(API_URL + "admin", { headers: authHeader() });
// };

const userService = {
  getAllUsers,
  deleteUser,
  // getUserBoard,
  // getModeratorBoard,
  // getAdminBoard,
};

export default userService