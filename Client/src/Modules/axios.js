import axios from "axios";

export default axios.create({
    baseURL : "http://localhost:6565",
    withCredentials : true
})