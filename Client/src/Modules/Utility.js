export default function Convert2Dict(Token){
    return (Token.split(";").reduce((obj,pair) => {
        const [key,value] = pair.split("=")
        obj[key.trim()] = value.trim()
        return obj
    },{}))
}