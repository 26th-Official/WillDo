import axios from "axios";

export default axios.create({
    baseURL : "https://will-do.onrender.com",
    withCredentials : true,
    timeout : 15000
})