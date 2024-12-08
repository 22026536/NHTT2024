import mysql from 'mysql2';

// Tạo một kết nối đơn lẻ
const connection = mysql.createConnection({
    host: '10.96.210.203', // Địa chỉ của máy chủ cơ sở dữ liệu
    port: 3306,
    user: 'fall2024c8g13', // Tên người dùng của cơ sở dữ liệu
    password: 'nhtt2024', // Mật khẩu của cơ sở dữ liệu
    database: 'fall2024c8g13_nhtt' // Tên của cơ sở dữ liệu
});
// Kết nối đến cơ sở dữ liệu
connection.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);
});

export default connection;

// import mysql from 'mysql2/promise'; // Sử dụng 'promise' để hỗ trợ async/await

// // Tạo một kết nối đơn lẻ
// const connection = await mysql.createConnection({
//     host: '10.96.210.203', // Địa chỉ máy chủ MySQL
//     port: 3306,                      // Cổng MySQL (thường là 3306)
//     user: 'fall2024c8g13',           // Tên người dùng MySQL
//     password: 'nhtt2024',            // Mật khẩu của người dùng
//     database: 'fall2024c8g13_lab',   // Tên cơ sở dữ liệu
//     connectTimeout: 10000 // Tăng thời gian timeout lên 10 giây
// });

// // Kết nối đến cơ sở dữ liệu
// try {
//     await connection.connect();
//     console.log('Connected to the database');
// } catch (err) {
//     console.error('Error connecting to the database:', err.message);
// }

// export default connection;
