function Test(params) {
    if (1===1){
        return new Promise((resolve, reject) => {
            setInterval(() => {
                resolve(params)
            },[5000])
        })
    }
    else{
        return new Promise((resolve, reject) => {
            reject("Error")
        })
    }
}


