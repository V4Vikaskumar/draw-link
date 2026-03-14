import axios from "axios";
import { backend_link } from "../functions_files/socketlink";

export default axios.create({
  baseURL: backend_link,
});