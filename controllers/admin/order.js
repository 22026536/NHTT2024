import connection from "../../models/SQLConnection.js";

// [GET] /admin/orders
export const index = async (req, res) => {
    // SELECT * FROM orders;

    // Tìm kiếm
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%'; // Nếu không có từ khóa, tìm tất cả
    // Hết Tìm kiếm

    // Phân trang
    let limitItems = 100;
    if (req.query.limitItems) {
        limitItems = parseInt(`${req.query.limitItems}`);
    }

    let page = 1;
    if (req.query.page) {
        page = parseInt(`${req.query.page}`);
    }

    const skip = (page - 1) * limitItems;
    // Hết phân trang

    // Sắp xếp theo tiêu chí

    const sortKey = req.query.sortKey || "order_date";
    const sortValue = req.query.sortValue === "desc" ? "DESC" : "ASC";

    // Hết Sắp xếp theo tiêu chí

    const queryOrder =
        `SELECT o.*, u.username, f.film_name, c.cinema_name, r.room_name, s.show_date
        FROM orders o
        JOIN showtimes s ON o.showtime_id = s.showtime_id
        JOIN cinemas c ON s.cinema_id = c.cinema_id
        JOIN rooms r ON s.room_id = r.room_id
        JOIN films f on s.film_id = f.film_id
        JOIN users u ON o.user_id = u.user_id
        WHERE f.film_name LIKE ?
        ORDER BY ${sortKey} ${sortValue} 
        LIMIT ?
        OFFSET ?`;

    const orders = await new Promise((resolve, reject) => {
        connection.query(queryOrder, [keyword, limitItems, skip], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    res.json(orders);
};

// [GET] /admin/orders/detail/:orderId
export const detail = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);

        const orderInfo = {};

        // Truy vấn Ticket, seats, rooms, cinemas
        const queryTicket_Seat_Room =
            `SELECT c.cinema_name, r.room_name, s.seat_row, s.seat_number, t.ticket_price
            FROM tickets t
            JOIN seats s ON t.seat_id = s.seat_id
            JOIN rooms r ON s.room_id = r.room_id
            JOIN cinemas c ON r.cinema_id = c.cinema_id
            WHERE t.order_id = ?;`
            ;
        orderInfo.Ticket_Seat_Room = await new Promise((resolve, reject) => {
            connection.query(queryTicket_Seat_Room, [orderId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Truy vấn popcorn
        const queryPopcorn =
            `SELECT pc.combo_name, pc.combo_price, po.combo_quantity
            FROM popcorn_combos pc
            JOIN popcorn_orders po ON pc.combo_id = po.combo_id
            where po.order_id = ?`;
        orderInfo.popcorn = await new Promise((resolve, reject) => {
            connection.query(queryPopcorn, [orderId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Truy vấn thông tin order: người đặt?, phim?, thời gian chiếu?
        const queryOrder =
            `SELECT o.*, u.username, f.film_name, s.show_date
            FROM orders o
            JOIN showtimes s ON o.showtime_id = s.showtime_id
            JOIN films f on s.film_id = f.film_id
            JOIN users u ON o.user_id = u.user_id
            WHERE o.order_id = ?`;
        orderInfo.order = await new Promise((resolve, reject) => {
            connection.query(queryOrder, [orderId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        res.json(orderInfo);
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: "Not Found"
        });
    }
}

// [POST] /admin/orders/create
// export const create = async (req, res) => {
//     const { room_name, cinema_name } =  req.body;

//     const countResult = await connection.promise().query(
//         `SELECT COUNT(*) as count FROM rooms`,
//     );
//     const totalRooms = countResult[0][0].count;
//     const roomId =  totalRooms + 1;

//     // Truy vấn cinema_id từ cinema_name
//     const  queryCinema = `Select cinema_id from cinemas where cinema_name = ?`
//     const cinemaInfo = await new Promise((resolve, reject) => {
//         connection.query(queryCinema, [cinema_name], (err, results) => {
//             if (err) return reject(err);
//             resolve(results);
//         });
//     });
//     const cinemaId = cinemaInfo[0].cinema_id;

//     // Lưu data vào bảng rooms
//     const queryInsertRoom = `INSERT INTO rooms 
//                             VALUES (?, ?, ?)`;
//     const room = await new Promise((resolve, reject) => {
//         connection.query(queryInsertRoom, [roomId, room_name, cinemaId], (err, results) => {
//             if (err) return reject(err);
//             resolve(results);
//         });
//     });

//     // Kiểm tra xem bản ghi có được tạo thành công không
//     if (room) {
//         res.status(201).json({
//             message: "Room created successfully",
//             roomId: room[0], // ID của bản ghi mới được tạo
//         });
//     } else {
//         res.status(500).json({
//             message: "Error creating room",
//         });
//     }
// }

// [PATCH] /admin/orders/edit/:orderId
// export const edit = async (req, res) => {
//     try {
//         const orderId = parseInt(req.params.orderId);

//         const { room_name, cinema_name } =  req.body;

//         // Truy vấn cinema_id từ cinema_name
//         const  queryCinema = `Select cinema_id from cinemas where cinema_name = ?`
//         const cinemaInfo = await new Promise((resolve, reject) => {
//             connection.query(queryCinema, [cinema_name], (err, results) => {
//                 if (err) return reject(err);
//                 resolve(results);
//             });
//         });
//         const cinemaId = cinemaInfo[0].cinema_id;

//         const queryUpdateRoom = `UPDATE rooms
//                                 SET room_name = ?, cinema_id = ?
//                                 WHERE room_id = ?`;
//         await new Promise((resolve, reject) => {
//             connection.query(queryUpdateRoom, [room_name, cinemaId, roomId], (err, results) => {
//                 if (err) return reject(err);
//                 resolve(results);
//             });
//         });
//         res.status(200).json({
//             message: "Room updated successfully",
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: "Not Found",
//             error: error.message
//         });
//     }
// }

// [DELETE] /admin/orders/delete/:orderId
export const deleteItem = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Xóa ở tickets
        const queryDeleteTicket = `DELETE FROM tickets WHERE order_id = ?`
        // Xóa ở popcorn_order
        const queryDeletePopcornOrder = `DELETE FROM popcorn_orders WHERE order_id = ?`

        const queryDeleteOrder = `DELETE FROM orders WHERE order_id = ?`;

        await Promise.all([
            connection.promise().query(queryDeleteTicket, [orderId]),
            connection.promise().query(queryDeletePopcornOrder, [orderId]),
            connection.promise().query(queryDeleteOrder, [orderId]),
        ]);

        res.status(200).json({
            message: "Order and related records deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error deleting Order",
            error: error.message,
        });
    }
}