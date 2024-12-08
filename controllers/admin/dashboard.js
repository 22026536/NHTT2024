import connection from "../../models/SQLConnection.js";

// [GET] /admin/dashboard
export const index = async (req, res) => {
    try {
        // Nếu không có req.query.month thì dùng tháng hiện tại
        const currentDate = new Date();
        const month = req.query.month || currentDate.getMonth() + 1; // Tháng hiện tại (1-12)
        const year = currentDate.getFullYear();

        const queryOrder = `SELECT COUNT(*) AS totalOrders FROM orders WHERE MONTH(order_date) = ? AND YEAR(order_date) = ?`;
        const queryRevenue = `SELECT SUM(total_price) AS totalRevenue FROM orders WHERE MONTH(order_date) = ? AND YEAR(order_date) = ?`;
        const queryNewUser = `SELECT COUNT(*) AS newUsers FROM users WHERE MONTH(date) = ? AND YEAR(date) = ?`;

        const [orderResult] = await connection.promise().query(queryOrder, [month, year]);
        const [revenueResult] = await connection.promise().query(queryRevenue, [month, year]);
        const [newUserResult] = await connection.promise().query(queryNewUser, [month, year]);

        const statistic = {
            order: orderResult[0].totalOrders || 0,
            revenue: revenueResult[0].totalRevenue || 0,
            newUser: newUserResult[0].newUsers || 0,
        };

        // Tổng vé và doanh thu theo film

        // Phân trang
        let limitItems = 8;
        if (req.query.limitItems) {
            limitItems = parseInt(`${req.query.limitItems}`);
        }

        let page = 1;
        if (req.query.page) {
            page = parseInt(`${req.query.page}`);
        }

        const skip = (page - 1) * limitItems;
        // Hết phân trang

        const queryFilm_Ticket_Revenue =
            `SELECT 
            f.film_id,
            f.film_name,
            COUNT(t.ticket_id) AS total_tickets_sold,
            SUM(t.ticket_price) AS total_revenue
            FROM films f
        LEFT JOIN 
            showtimes s ON f.film_id = s.film_id
        LEFT JOIN 
            orders o ON s.showtime_id = o.showtime_id
        LEFT JOIN 
            tickets t ON o.order_id = t.order_id
        GROUP BY 
            f.film_id, f.film_name
        ORDER BY
            total_revenue DESC
        LIMIT ?
        OFFSET ?
        ;`;
        const [filmResult] = await connection.promise().query(queryFilm_Ticket_Revenue, [limitItems, skip]);
        statistic.filmResult = filmResult;

        res.json(statistic);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
