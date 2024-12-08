import connection from "../../models/SQLConnection.js";

// [GET] /admin/showtimes
export const index = async (req, res) => {
    // // SELECT * FROM showtimes;

    // Lọc theo trạng thái
    // Hết lọc theo trạng thái

    // Tìm kiếm
    const keywordCinema = req.query.keywordCinema ? `%${req.query.keywordCinema}%` : '%'; // Nếu không có từ khóa, tìm tất cả
    const keywordRoom = req.query.keywordRoom ? `%${req.query.keywordRoom}%` : '%';
    const keywordDate = req.query.keywordDate ? `%${req.query.keywordDate}%` : '%';
    // Hết Tìm kiếm

    // Phân trang
    let limitItems = 80;
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

    const sortKey = req.query.sortKey || "show_date";
    const sortValue = req.query.sortValue === "desc" ? "DESC" : "ASC";

    // Hết Sắp xếp theo tiêu chí

    const queryShowTime =
        `SELECT s.*, f.film_name, c.cinema_name, r.room_name 
        FROM showtimes s
        JOIN cinemas c ON s.cinema_id = c.cinema_id
        JOIN rooms r ON s.room_id = r.room_id
        JOIN films f on s.film_id = f.film_id
        WHERE c.cinema_name LIKE ?
        AND r.room_name LIKE ?
        AND  s.show_date LIKE ?
        ORDER BY ${sortKey} ${sortValue} 
        LIMIT ?
        OFFSET ?`;
    const showtimes = await new Promise((resolve, reject) => {
        connection.query(queryShowTime, [keywordCinema, keywordRoom, keywordDate, limitItems, skip], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    res.json(showtimes);
};

// [GET] /admin/showtimes/detail/:showTimeId
export const detail = async (req, res) => {
    try {
        const showTimeId = req.params.showTimeId;

        const showTimeInfo = {};

        const queryShowTime = `Select * from showtimes where showtime_id = ?`;
        const showTime = await new Promise((resolve, reject) => {
            connection.query(queryShowTime, [showTimeId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        showTimeInfo.showTime = showTime;

        if (showTime.length > 0) {
            // Truy vấn film_name từ film_id trong bảng showtimes
            const queryFilm = `Select f.film_id, f.film_name
                            from films as f
                            inner join showtimes as st on st.film_id = f.film_id
                            where st.showtime_id = ?`;
            showTimeInfo.film = await new Promise((resolve, reject) => {
                connection.query(queryFilm, [showTimeId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            // Truy vấn cinema_name từ cinema_id trong bảng showtimes
            const queryCinema = `Select c.cinema_id, c.cinema_name
                    from cinemas as c
                    inner join showtimes as st on st.cinema_id = c.cinema_id
                    where st.showtime_id = ?`
            showTimeInfo.cinema = await new Promise((resolve, reject) => {
                connection.query(queryCinema, [showTimeId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            // Truy vấn room_name từ room_id trong bảng showtimes
            const queryRoom = `Select r.room_id, r.room_name
                    from rooms as r
                    inner join showtimes as st on st.room_id = r.room_id
                    where st.showtime_id = ?`
            showTimeInfo.room = await new Promise((resolve, reject) => {
                connection.query(queryRoom, [showTimeId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            res.json(showTimeInfo);
        }
        else {
            res.json({
                messages: {
                    error: "ShowTime not found"
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

// [GET] /admin/showtimes/create
export const create = async (req, res) => {
    try {
        const [films] = await connection.promise().query(`SELECT film_id, film_name FROM films`);
        const [cinemas] = await connection.promise().query(`SELECT cinema_id, cinema_name FROM cinemas`);
        const [rooms] = await connection.promise().query(`SELECT room_id, room_name FROM rooms`);

        res.json({
            filmsToChoose: films,
            cinemasToChoose: cinemas,
            roomsToChoose: rooms
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating showtime",
            error: error
        });
    }
}

// [POST] /admin/showtimes/create
export const createPost = async (req, res) => {
    const { film_name, room_name, cinema_name, show_date, show_time } = req.body;

    const countResult = await connection.promise().query(
        `SELECT COUNT(*) as count FROM showtimes`,
    );
    const totalShowTimes = countResult[0][0].count;
    const showTimeId = totalShowTimes + 1;

    // Truy vấn film_id từ film_name
    const queryFilm = `Select film_id, duration from films where film_name = ?`
    const filmInfo = await new Promise((resolve, reject) => {
        connection.query(queryFilm, [film_name], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
    if (filmInfo.length == 0) {
        return res.status(400).json({ message: "Film not found" });
    }
    const filmId = filmInfo[0].film_id;
    const filmDuration = filmInfo[0].duration;

    // Truy vấn room_id từ room_name
    const queryRoom = `Select room_id from rooms where room_name = ?`
    const roomInfo = await new Promise((resolve, reject) => {
        connection.query(queryRoom, [room_name], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
    if (roomInfo.length == 0) {
        return res.status(400).json({ message: "Room not found" });
    }
    const roomId = roomInfo[0].room_id;

    // Truy vấn cinema_id từ cinema_name
    const queryCinema = `Select cinema_id from cinemas where cinema_name = ?`
    const cinemaInfo = await new Promise((resolve, reject) => {
        connection.query(queryCinema, [cinema_name], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
    if (cinemaInfo.length == 0) {
        return res.status(400).json({ message: "Cinema not found" });
    }
    const cinemaId = cinemaInfo[0].cinema_id;

    // Kiểm tra xem showtime mới có trùng thời gian với các showtime đã tồn tại không
    const queryCheckOverlap = `
            SELECT * FROM showtimes 
            WHERE room_id = ? AND cinema_id = ? 
            AND (
                (show_date = ? AND 
                 (
                     (show_time <= ? AND ADDTIME(show_time, SEC_TO_TIME(? * 60)) > ?) OR
                     (show_time >= ? AND show_time < ADDTIME(?, SEC_TO_TIME(? * 60)))
                 )
                )
            )
        `;
    const overlapCheck = await new Promise((resolve, reject) => {
        connection.query(
            queryCheckOverlap,
            [
                roomId, cinemaId,
                show_date,
                show_time, filmDuration, show_time,
                show_time, show_time, filmDuration
            ],
            (err, results) => {
                if (err) return reject(err);
                resolve(results);
            }
        );
    });

    if (overlapCheck.length > 0) {
        return res.status(400).json({ message: "Showtime conflicts with an existing showtime in this room and cinema" });
    }

    // Lưu data vào bảng showtimes
    const queryInsertShowTime = `INSERT INTO showtimes (showtime_id, film_id, room_id, cinema_id, show_date, show_time)
                VALUES (?, ?, ?, ?, ?, ?)`;
    const showtime = await new Promise((resolve, reject) => {
        connection.query(queryInsertShowTime, [showTimeId, filmId, roomId, cinemaId, show_date, show_time], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    // Kiểm tra xem bản ghi có được tạo thành công không
    if (showtime) {
        res.status(201).json({
            message: "Showtime created successfully",
            showTimeId: showtime[0], // ID của bản ghi mới được tạo
        });
    } else {
        res.status(500).json({
            message: "Error creating Showtime",
        });
    }
}

// [GET] /admin/showtimes/edit/:showTimeId
export const edit = async (req, res) => {
    try {
        const showTimeId = req.params.showTimeId;

        const showTimeInfo = {};

        const queryShowTime = `Select * from showtimes where showtime_id = ?`;
        const showTime = await new Promise((resolve, reject) => {
            connection.query(queryShowTime, [showTimeId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        showTimeInfo.showTime = showTime;

        if (showTime.length > 0) {
            // Truy vấn film_name từ film_id trong bảng showtimes
            const queryFilm = `Select f.film_id, f.film_name
                            from films as f
                            inner join showtimes as st on st.film_id = f.film_id
                            where st.showtime_id = ?`;
            showTimeInfo.film = await new Promise((resolve, reject) => {
                connection.query(queryFilm, [showTimeId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            // Truy vấn cinema_name từ cinema_id trong bảng showtimes
            const queryCinema = `Select c.cinema_id, c.cinema_name
                    from cinemas as c
                    inner join showtimes as st on st.cinema_id = c.cinema_id
                    where st.showtime_id = ?`
            showTimeInfo.cinema = await new Promise((resolve, reject) => {
                connection.query(queryCinema, [showTimeId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            // Truy vấn room_name từ room_id trong bảng showtimes
            const queryRoom = `Select r.room_id, r.room_name
                    from rooms as r
                    inner join showtimes as st on st.room_id = r.room_id
                    where st.showtime_id = ?`
            showTimeInfo.room = await new Promise((resolve, reject) => {
                connection.query(queryRoom, [showTimeId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const [films] = await connection.promise().query(`SELECT film_id, film_name FROM films`);
            const [cinemas] = await connection.promise().query(`SELECT cinema_id, cinema_name FROM cinemas`);
            const [rooms] = await connection.promise().query(`SELECT room_id, room_name FROM rooms`);

            res.json({
                showTimeInfo: showTimeInfo,
                filmsToChoose: films,
                cinemasToChoose: cinemas,
                roomsToChoose: rooms
            });
        }
        else {
            res.json({
                messages: {
                    error: "Showtime not found"
                }
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error editing Showtime",
            error: error
        });
    }
}

// [PATCH] /admin/showtimes/edit/:showTimeId
export const editPatch = async (req, res) => {
    try {
        const showTimeId = parseInt(req.params.showTimeId);

        const { film_name, room_name, cinema_name, show_date, show_time } = req.body;

        // Truy vấn film_id từ film_name
        const queryFilm = `Select film_id, duration from films where film_name = ?`
        const filmInfo = await new Promise((resolve, reject) => {
            connection.query(queryFilm, [film_name], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        if (filmInfo.length == 0) {
            return res.status(400).json({ message: "Film not found" });
        }
        const filmId = filmInfo[0].film_id;
        const filmDuration = filmInfo[0].duration;

        // Truy vấn room_id từ room_name
        const queryRoom = `Select room_id from rooms where room_name = ?`
        const roomInfo = await new Promise((resolve, reject) => {
            connection.query(queryRoom, [room_name], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        if (roomInfo.length == 0) {
            return res.status(400).json({ message: "Room not found" });
        }
        const roomId = roomInfo[0].room_id;

        // Truy vấn cinema_id từ cinema_name
        const queryCinema = `Select cinema_id from cinemas where cinema_name = ?`
        const cinemaInfo = await new Promise((resolve, reject) => {
            connection.query(queryCinema, [cinema_name], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        if (cinemaInfo.length == 0) {
            return res.status(400).json({ message: "Cinema not found" });
        }
        const cinemaId = cinemaInfo[0].cinema_id;

        // Kiểm tra xem showtime mới có trùng thời gian với các showtime đã tồn tại không
        const queryCheckOverlap = `
            SELECT * FROM showtimes 
            WHERE room_id = ? AND cinema_id = ? 
            AND (
                (show_date = ? AND 
                (
                    (show_time <= ? AND ADDTIME(show_time, SEC_TO_TIME(? * 60)) > ?) OR
                    (show_time >= ? AND show_time < ADDTIME(?, SEC_TO_TIME(? * 60)))
                )
                )
            )
            `;
        const overlapCheck = await new Promise((resolve, reject) => {
            connection.query(
                queryCheckOverlap,
                [
                    roomId, cinemaId,
                    show_date,
                    show_time, filmDuration, show_time,
                    show_time, show_time, filmDuration
                ],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });

        if (overlapCheck.length > 0) {
            return res.status(400).json({ message: "Showtime conflicts with an existing showtime in this room and cinema" });
        }

        const queryUpdateShowTime = `UPDATE showtimes
                                SET film_id = ?, room_id = ?, cinema_id = ?, show_date = ?, show_time = ?
                                WHERE showtime_id = ?`;
        await new Promise((resolve, reject) => {
            connection.query(queryUpdateShowTime, [filmId, roomId, cinemaId, show_date, show_time, showTimeId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        res.status(200).json({
            message: "Showtime updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Not Found",
            error: error.message
        });
    }
}

// [DELETE] /admin/showtimes/delete/:showTimeId
export const deleteItem = async (req, res) => {
    try {
        const showTimeId = req.params.showTimeId;

        await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
                if (err) return reject(err);

                const queryDeleteSeatStatus = `DELETE FROM seat_status WHERE showtime_id = ?`;
                connection.query(queryDeleteSeatStatus, [showTimeId], (err, results) => {
                    if (err) return connection.rollback(() => reject(err));

                    const queryDeleteShowTime = `DELETE FROM showtimes WHERE showtime_id = ?`;
                    connection.query(queryDeleteShowTime, [showTimeId], (err, results) => {
                        if (err) return connection.rollback(() => reject(err));

                        // Step 3: Commit the transaction if both deletions are successful
                        connection.commit((err) => {
                            if (err) return connection.rollback(() => reject(err));

                            resolve(results);
                        });
                    });
                });
            });
        });

        res.status(200).json({
            message: "Showtime and related records deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error deleting Showtime",
            error: error.message,
        });
    }
};
