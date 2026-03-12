import axios from "axios";
import socket_link from "../functions_files/socketlink";

export default axios.create({
  baseURL: socket_link,
});