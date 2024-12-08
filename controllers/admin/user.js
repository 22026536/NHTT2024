import connection from "../../models/SQLConnection.js";

// [GET] /admin/users
export const index = async (req, res) => {
    // SELECT * FROM users;

    // Lọc theo trạng thái
    const status = req.query.status;
    let userStatus = '(status = 1 OR status = 0)';

    if (status) {
        if (status == "Hoạt động") userStatus = 'status = 1';
        else if (status == "Không hoạt động") userStatus = 'status = 0';
    }
    // Hết lọc theo trạng thái

    // Tìm kiếm
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%'; // Nếu không có từ khóa, tìm tất cả
    // Hết Tìm kiếm

    // Phân trang
    let limitItems = 5;
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

    const sortKey = req.query.sortKey || "full_name";
    const sortValue = req.query.sortValue === "desc" ? "DESC" : "ASC";

    // Hết Sắp xếp theo tiêu chí

    const queryUser =
        `SELECT *
        FROM users
        WHERE username LIKE ?
        AND ${userStatus}
        ORDER BY ${sortKey} ${sortValue} 
        LIMIT ?
        OFFSET ?`;

    const users = await new Promise((resolve, reject) => {
        connection.query(queryUser, [keyword, limitItems, skip], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    res.json(users);
};

// [GET] /admin/users/detail/:userId
export const detail = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const userInfo = {};

        // Truy vấn user
        const queryUser = `SELECT * FROM users WHERE user_id = ?`;
        const user = await new Promise((resolve, reject) => {
            connection.query(queryUser, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        userInfo.user = user;

        if (user.length > 0) {
            const queryOrder =
                `SELECT o.*, f.film_name, c.cinema_name, r.room_name, s.show_date, pc.combo_name, po.combo_quantity, pc.combo_price
                FROM users u
                JOIN orders o ON u.user_id = o.user_id
                JOIN showtimes s ON o.showtime_id = s.showtime_id
                JOIN cinemas c ON s.cinema_id = c.cinema_id
                JOIN rooms r ON s.room_id = r.room_id
                JOIN films f on s.film_id = f.film_id
                JOIN popcorn_orders po ON o.order_id = po.order_id
                JOIN popcorn_combos pc ON po.combo_id = pc.combo_id
                WHERE u.user_id = ?`;
            userInfo.order = await new Promise((resolve, reject) => {
                connection.query(queryOrder, [userId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            // Check if there are orders
            if (userInfo.order.length > 0) {
                userInfo.order.forEach(order => {
                    order.combo_total_price = order.combo_price * order.combo_quantity;
                    delete order.combo_price; // Remove combo_price after calculating total price
                });
            }

            res.json(userInfo);
        }
        else {
            res.json({
                messages: {
                    error: "User not found"
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: "Not Found"
        });
    }
}

// [GET] /admin/users/edit/:userId
export const edit = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const userInfo = {};

        // Truy vấn user
        const queryUser = `SELECT * FROM users WHERE user_id = ?`;
        const user = await new Promise((resolve, reject) => {
            connection.query(queryUser, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        userInfo.user = user;

        if (user.length > 0) {
            res.json(userInfo);
        }
        else {
            res.json({
                messages: {
                    error: "User not found"
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: "Not Found"
        });
    }
}

// [PATCH] /admin/users/edit/:userId
export const editPatch = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        // Không gửi ảnh khác lên
        if (res.locals.url == "") {
            let { username, email, phone_number, full_name, sex, date_of_birth, role, status } = req.body;
            if (sex == "male") sex = 1;
            else sex = 2;
            if (role == "user") role = 0;
            else role = 1;

            // Update bảng User
            const queryUpdateUser = `
                UPDATE users
                SET username = ?, email = ?, phone_number = ?, full_name = ?, sex = ?, date_of_birth = ?, role = ?, status = ?
                WHERE user_id = ?`;
            await new Promise((resolve, reject) => {
                connection.query(queryUpdateUser, [username, email, phone_number, full_name, sex, date_of_birth, role, status, userId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

        } else { // Có gửi ảnh khác lên
            let { username, email, phone_number, full_name, sex, date_of_birth, role, status } = req.body;
            if (sex == "male") sex = 1;
            else sex = 2;
            if (role == "user") role = 0;
            else role = 1;

            // Update bảng User
            const queryUpdateUser = `
                UPDATE users
                SET username = ?, user_img = ?, email = ?, phone_number = ?, full_name = ?, sex = ?, date_of_birth = ?, role = ?, status = ?
                WHERE user_id = ?`;
            await new Promise((resolve, reject) => {
                connection.query(queryUpdateUser, [username, res.locals.url, email, phone_number, full_name, sex, date_of_birth, role, status, userId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        }

        res.status(200).json({
            message: "User updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Not Found",
            error: error
        });
    }
}

// [DELETE] /admin/users/delete/:userId
export const deleteItem = async (req, res) => {
    try {
        const userId = req.params.userId;

        const [orderId] = await connection.promise().query(`SELECT order_id FROM orders WHERE user_id = ?`, [userId]);

        const queryDeleteUser = `DELETE FROM users WHERE user_id = ?`

        // Nếu user này đã từng order thì mới xóa
        if (orderId.length > 0) {
            // Xóa ở tickets
            const queryDeleteTicket = `DELETE FROM tickets WHERE order_id = ?`
            // Xóa ở popcorn_order
            const queryDeletePopcornOrder = `DELETE FROM popcorn_orders WHERE order_id = ?`

            const queryDeleteOrder = `DELETE FROM orders WHERE user_id = ?`;

            await Promise.all([
                connection.promise().query(queryDeleteTicket, [orderId[0].order_id]),
                connection.promise().query(queryDeletePopcornOrder, [orderId[0].order_id]),
                connection.promise().query(queryDeleteOrder, [userId]),
                connection.promise().query(queryDeleteUser, [userId]),
            ]);
        } else {
            await connection.promise().query(queryDeleteUser, [userId]);
        }

        res.status(200).json({
            message: "User and related records deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error deleting User",
            error: error.message,
        });
    }
}

// [PATCH] /admin/users/change-role/:userId
export const changeRole = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const [userResult] = await connection.promise().query(
            'SELECT role FROM users WHERE user_id = ?', [userId]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentRole = userResult[0].role;

        const newRole = currentRole == 0 ? 1 : 0;

        const [updateResult] = await connection.promise().query(
            'UPDATE users SET role = ? WHERE user_id = ?',
            [newRole, userId]
        );

        if (updateResult.affectedRows > 0) {
            res.status(200).json({
                code: 200,
                message: "User role changed successfully",
                newRole: newRole
            });
        } else {
            res.status(500).json({
                code: 500,
                message: "Failed to update user role"
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Error changing user role",
            error: error.message
        });
    }
};

// [PATCH] /admin/users/change-status/:userId
export const changeStatus = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const [userResult] = await connection.promise().query(
            'SELECT status FROM users WHERE user_id = ?', [userId]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentStatus = userResult[0].status;

        const newStatus = currentStatus == 0 ? 1 : 0;

        const [updateResult] = await connection.promise().query(
            'UPDATE users SET status = ? WHERE user_id = ?',
            [newStatus, userId]
        );

        if (updateResult.affectedRows > 0) {
            res.status(200).json({
                code: 200,
                message: "User Status changed successfully",
                newStatus: newStatus
            });
        } else {
            res.status(500).json({
                code: 500,
                message: "Failed to update user status"
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Error changing user status",
            error: error.message
        });
    }
};