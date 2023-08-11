const a = "csrf_access_token=98187c7c-a518-463d-9b00-5fc22554bdf3; csrf_refresh_token=99dc85a2-8b7c-46d5-9ddc-f3e323eb5b9c"
console.warn(a.split(";").reduce((obj,pair) => {
    const [key,value] = pair.split("=")
    obj[key.trim()] = value.trim()
    return obj
},{}))