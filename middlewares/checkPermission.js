// import { verifyToken, isTokenExpired } from "./JWT";
// import systemConfig from "../config/systemConfig";
// import dotenv from "dotenv";
// import connection from "../models/SQLConnection";
// dotenv.config();

// const SECRET_CODE = process.env.SECRET_CODE

// export const checkPermisson = async (req, res, next) => {
//     try {
//         // // buoc 1: nguoi dung dang nhap hay chua
//         // // let token = null;
//         // // if(req.session.user){
//         // //     token = req.cookies.jwt;
//         // // }
//         // // // buoc 2: kiem tra token
//         // // if(!token || isTokenExpired(token)){
//         // //     res.redirect("/auth/")
//         // // }
//         // if(!req.session||!req.session.user){
//         //     res.redirect("/auth/")
//         // }
//         // else{


//         // // // buoc 3: kiem tra quyen nguoi dung
//         // //     const token = req.cookies.jwt
//         // //     if(!token || isTokenExpired(token)){
//         // //             return res.status(404).json({
//         // //                 message: "loi token"
//         // //             })
//         // //         }
//         // //     const decoded = verifyToken(token);
//         // //     connection.query(`SELECT * from customers where id = ${decoded}`, (error, results, fields) => {
//         // //         if (results) {
//         // //             return res.status(404).json({
//         // //                 message: "loi user"
//         // //             })
//         // //         }
//         // //     })
//         // }
//         // if(!req.session||!req.session.user){
//         //     res.clearCookie("jwt");
//         //     res.clearCookie("user_name");
//         //     res.clearCookie("name");
//         //     res.clearCookie("phoneNumber");
//         //     res.clearCookie("address");
//         //     res.clearCookie("birthday");
//         //     res.clearCookie("sessionId")
//         //     res.render("index.html")
//         // }

//         if (!req.cookies.jwt) {
//             return res.status(401).json({
//                 messages: "Unauthorized\nPlease login first!"
//             });
//         }

//         const userId = verifyToken(req.cookies.jwt);

//         // Nếu token expired hoặc không hợp lệ thì userId sẽ null
//         if (!userId || isTokenExpired(req.cookies.jwt)) {
//             return res.status(401).json({
//                 messages: "Token is expired or invalid\nPlease login first!"
//             });
//         }

//         const [user] = await connection.promise().query(`SELECT * FROM users WHERE user_id = ?`, [userId.id])

//         if (user.length == 0) {
//             return res.status(401).json({
//                 messages: "Token is expired or invalid\nPlease login first!"
//             });
//         }

//         res.locals.user = user;

//         next();
//     } catch (error) {
//         console.log(error)
//     }
// }