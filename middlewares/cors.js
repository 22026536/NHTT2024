import cors from "cors";

const corsOptions = {
    origin: '*', // Cho phép tất cả các nguồn,
    credentials: true, // Cho phép gửi cookie hoặc thông tin xác thực
    optionsSuccessStatus: 200, // Đảm bảo các trình duyệt cũ không báo lỗi
};

export default cors(corsOptions);


// // const whitelist = new Set(['http://example.com', 'https://example.org']);
// const whitelist = new Set(['*']);
// const corOptions = {
//     optionsSuccesStatus: 200,
//     origin: function(origin,callback) {
//         // if(whitelist.has(origin)) {
//         //     callback(null,true);
//         // } else {
//         //     callback(new Error("Not allowed by CORS"));
//         // }
//         callback(null,true)
//     },

//     credentials: true
// }


// export default cors(corOptions);

// export default function corMw(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*'); // Cho phép tất cả các nguồn
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.header('Access-Control-Allow-Credentials', 'true'); // Cho phép gửi cookie
//     if (req.method === 'OPTIONS') {
//       return res.sendStatus(200); // Xử lý nhanh cho preflight request
//     }
//     next();
//   }