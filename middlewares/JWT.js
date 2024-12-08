import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const SECRET_CODE = process.env.SECRET_CODE

export const createJWT = (payload) => {
    let token = null;
    try{
        token = jwt.sign(payload,SECRET_CODE,{ expiresIn: '30m' });
    } catch (err){
        console.log(err);
    }
    return token;
}

export const verifyToken = (token) => {
    let data = null;
    try {
        let decoded = jwt.verify(token,SECRET_CODE);
        data = decoded
    } catch (err) {
        console.log(err);
    }
    return data;
}

export const isTokenExpired = (token) => {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
      
        const { exp } = JSON.parse(jsonPayload);
        const expired = Date.now() >= exp * 1000
        return expired
}