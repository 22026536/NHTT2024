// import connection from "../../models/SQLConnection.js";

// async function filmInfoForAI() {
//     const query = 'SELECT * FROM films';

//     return new Promise((resolve, reject) => {
//         connection.query(query, (error, results) => {
//             if (error) {
//                 return reject(error);  // Nếu có lỗi, từ chối promise
//             }
//             if (results.length > 0) {
//                 // Tạo ra một chuỗi chứa thông tin của từng phim
//                 const filmTexts = results.map(film =>
//                     `Phim ${film.film_name}, ngày chiếu ${film.Release_date}, nội dung: ${film.film_describe}, độ tuổi giới hạn: ${film.age_limit}`
//                 ).join('\n'); // Mỗi phim sẽ được in trên một dòng

//                 return resolve(filmTexts);  // Trả về kết quả khi hoàn thành
//             } else {
//                 return resolve(null);  // Trả về null nếu không có phim nào
//             }
//         });
//     });
// }

// export default filmInfoForAI