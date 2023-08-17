import axios from "axios";

export default axios.create({
    baseURL : "https://willdo-ov3j.onrender.com",
    withCredentials : true,
    timeout : 15000
})