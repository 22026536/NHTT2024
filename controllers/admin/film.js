import connection from "../../models/SQLConnection.js";

// [GET] /admin/films
export const index = async (req, res) => {
    // SELECT * FROM films;

    // Lọc theo trạng thái
    const status = req.query.status;
    let filmType = '(film_type = 1 OR film_type = 0)';

    if (status) {
        if (status == "Showing") filmType = 'film_type = 1';
        else if (status == "Coming") filmType = 'film_type = 0';
    }
    // Hết lọc theo trạng thái

    // Tìm kiếm
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%'; // Nếu không có từ khóa, tìm tất cả
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

    const sortKey = req.query.sortKey || "film_id";
    const sortValue = req.query.sortValue === "desc" ? "DESC" : "ASC";

    // Hết Sắp xếp theo tiêu chí

    // Truy vấn từ database
    const query = `
        SELECT * FROM films
        WHERE ${filmType} 
        AND film_name LIKE ?
        ORDER BY ${sortKey} ${sortValue}
        LIMIT ?
        OFFSET ?`;

    const films = await new Promise((resolve, reject) => {
        connection.query(query, [keyword, limitItems, skip], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    res.json(films);
};

// [GET] /admin/films/detail/:id
export const detail = async (req, res) => {
    try {
        const filmId = req.params.id;

        const filmInfo = {};

        const queryFilm = `Select * from films where films.film_id = ?`;

        const film = await new Promise((resolve, reject) => {
            connection.query(queryFilm, [filmId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        filmInfo.film = film;

        if (film.length > 0) {
            const queryActor = `Select A.actor_id,A.actor_name
                            from actors as A
                            inner join actor_film as AF on A.actor_id = AF.actor_id
                            inner join films as F on AF.film_id = F.film_id
                            where F.film_id = ?`;
            filmInfo.actors = await new Promise((resolve, reject) => {
                connection.query(queryActor, [filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const queryDirector = `Select D.director_id,D.director_name
                                    from directors as D
                                    inner join director_film as DF on D.director_id = DF.director_id
                                    inner join films as F on DF.film_id = F.film_id
                                    where F.film_id = ?`;
            filmInfo.directors = await new Promise((resolve, reject) => {
                connection.query(queryDirector, [filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const queryCategory = `Select C.category_id,C.category_name
                                    from categorys as C
                                    inner join category_film as CF on C.category_id = CF.category_id
                                    inner join films as F on CF.film_id = F.film_id
                                    where F.film_id = ?`;
            filmInfo.categories = await new Promise((resolve, reject) => {
                connection.query(queryCategory, [filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            res.json(filmInfo);
        }
        else {
            res.json({
                messages: {
                    error: "Film not found"
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

// [GET] /admin/films/create
export const create = async (req, res) => {
    try {
        // Đổ actors, directors, categories ra để admin chọn được thay thế cái cũ
        const [actors] = await connection.promise().query(`Select actor_id, actor_name from actors`);
        const [directors] = await connection.promise().query(`Select director_id, director_name from directors`);
        const [categories] = await connection.promise().query(`Select category_id, category_name from categorys`);

        res.json({
            actorToChoose: actors,
            directorToChoose: directors,
            categoryToChoose: categories,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creating film",
            error: error
        });
    }
}

// [POST] /admin/films/create
export const createPost = async (req, res) => {
    try {
        let { film_name, film_trailer, Release_date, film_describe, age_limit, duration, film_type, country, categories, directors, actors } = req.body;

        const countResult = await connection.promise().query(
            `SELECT COUNT(*) as count FROM films`,
        );
        const totalFilms = countResult[0][0].count;
        const filmId = totalFilms + 1;

        // Lưu data vào bảng films
        const queryFilm = `INSERT INTO films 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const film = await new Promise((resolve, reject) => {
            connection.query(queryFilm, [filmId, film_name, res.locals.url, film_trailer, Release_date, film_describe, age_limit, duration, film_type, country], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Lưu data vào bảng actor_film
        for (const actor of actors) {
            const queryActor = `SELECT actor_id FROM actors WHERE actor_name = ?`;
            const actorInfo = await new Promise((resolve, reject) => {
                connection.query(queryActor, [actor], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            const actorId = actorInfo[0].actor_id;
            const queryInsertActor = `INSERT INTO actor_film (film_id, actor_id) VALUES (?, ?)`;
            await new Promise((resolve, reject) => {
                connection.query(queryInsertActor, [filmId, actorId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        }

        // // Lưu data vào bảng director_film
        for (const director of directors) {
            const queryDirector = `SELECT director_id FROM directors WHERE director_name = ?`;
            const directorInfo = await new Promise((resolve, reject) => {
                connection.query(queryDirector, [director], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            const directorId = directorInfo[0].director_id;
            const queryInsertDirector = `INSERT INTO director_film (film_id, director_id) VALUES (?, ?)`;
            await new Promise((resolve, reject) => {
                connection.query(queryInsertDirector, [filmId, directorId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        }

        // Lưu data vào bảng category_film
        for (const category of categories) {
            const queryCategory = `SELECT category_id FROM categorys WHERE category_name = ?`;
            const categoryInfo = await new Promise((resolve, reject) => {
                connection.query(queryCategory, [category], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            const categoryId = categoryInfo[0].category_id;
            const queryInsertCategory = `INSERT INTO category_film (category_id, film_id) VALUES (?, ?)`;
            await new Promise((resolve, reject) => {
                connection.query(queryInsertCategory, [categoryId, filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        }

        // Kiểm tra xem bản ghi có được tạo thành công không
        if (film) {
            res.status(201).json({
                message: "Film created successfully",
                filmId: film.insertId, // ID của bản ghi mới được tạo
            });
        } else {
            res.status(500).json({
                message: "Error creating film",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(501).json({
            message: "Error creating film",
            error: error
        });
    }
}

// [GET] /admin/films/edit/:id
export const edit = async (req, res) => {
    try {
        const filmId = req.params.id;

        // filmInfo để đổ data cũ ra giao diện
        const filmInfo = {};

        const queryFilm = `Select * from films where films.film_id = ?`;

        const film = await new Promise((resolve, reject) => {
            connection.query(queryFilm, [filmId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        filmInfo.film = film;

        if (film.length > 0) {
            const queryActor = `Select A.actor_id,A.actor_name
                            from actors as A
                            inner join actor_film as AF on A.actor_id = AF.actor_id
                            inner join films as F on AF.film_id = F.film_id
                            where F.film_id = ?`;
            filmInfo.actors = await new Promise((resolve, reject) => {
                connection.query(queryActor, [filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const queryDirector = `Select D.director_id,D.director_name
                                    from directors as D
                                    inner join director_film as DF on D.director_id = DF.director_id
                                    inner join films as F on DF.film_id = F.film_id
                                    where F.film_id = ?`;
            filmInfo.directors = await new Promise((resolve, reject) => {
                connection.query(queryDirector, [filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const queryCategory = `Select C.category_id,C.category_name
                                    from categorys as C
                                    inner join category_film as CF on C.category_id = CF.category_id
                                    inner join films as F on CF.film_id = F.film_id
                                    where F.film_id = ?`;
            filmInfo.categories = await new Promise((resolve, reject) => {
                connection.query(queryCategory, [filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            // Đổ actors, directors, categories ra để admin chọn được thay thế cái cũ
            const [actors] = await connection.promise().query(`Select actor_id, actor_name from actors`);
            const [directors] = await connection.promise().query(`Select director_id, director_name from directors`);
            const [categories] = await connection.promise().query(`Select category_id, category_name from categorys`);

            res.json({
                filmInfo: filmInfo,
                actorToChoose: actors,
                directorToChoose: directors,
                categoryToChoose: categories,
            });
        }
        else {
            res.json({
                messages: {
                    error: "Film not found"
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error editing film",
            error: error
        })
    }
}

// [PATCH] /admin/films/edit/:id
export const editPatch = async (req, res) => {
    try {
        const filmId = parseInt(req.params.id);

        // Khi không gửi lên ảnh mới thì giữ nguyên cái link cũ
        if (res.locals.url == "") {
            let { film_name, film_trailer, Release_date, film_describe, age_limit, duration, film_type, country } = req.body;

            // Update bảng film
            const queryUpdateFilm = `
                UPDATE films
                SET film_name = ?, film_trailer = ?, Release_date = ?, film_describe = ?, age_limit = ?, duration = ?, film_type = ?, country = ?
                WHERE film_id = ?`;
            await new Promise((resolve, reject) => {
                connection.query(queryUpdateFilm, [film_name, film_trailer, Release_date, film_describe, age_limit, duration, film_type, country, filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

        } else { // Khi mà tải lên ảnh mới thì link ảnh thay bằng res.locals.url
            let { film_name, film_trailer, Release_date, film_describe, age_limit, duration, film_type, country } = req.body;

            // Update bảng film
            const queryUpdateFilm = `
                UPDATE films
                SET film_name = ?, film_img = ?, film_trailer = ?, Release_date = ?, film_describe = ?, age_limit = ?, duration = ?, film_type = ?, country = ?
                WHERE film_id = ?`;
            await new Promise((resolve, reject) => {
                connection.query(queryUpdateFilm, [film_name, res.locals.url, film_trailer, Release_date, film_describe, age_limit, duration, film_type, country, filmId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        }

        let { categories, directors, actors } = req.body;

        // Update bảng actor_film(nếu có)
        if (actors) {
            for (const actor of actors) {
                const queryActor = `SELECT actor_id FROM actors WHERE actor_name = ?`;
                const actorInfo = await new Promise((resolve, reject) => {
                    connection.query(queryActor, [actor], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
                const actorId = actorInfo[0].actor_id;
                const queryUpdateActorFilm = `UPDATE actor_film
                                        SET actor_id = ?
                                        WHERE film_id = ?`;
                await new Promise((resolve, reject) => {
                    connection.query(queryUpdateActorFilm, [actorId, filmId], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
            }
        }
        // Update bảng director_film(nếu có)
        if (directors) {
            for (const director of directors) {
                const queryDirector = `SELECT director_id FROM directors WHERE director_name = ?`;
                const directorInfo = await new Promise((resolve, reject) => {
                    connection.query(queryDirector, [director], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
                const directorId = directorInfo[0].director_id;
                const queryUpdateDirectorFilm = `UPDATE director_film
                                            SET director_id = ?
                                            WHERE film_id = ?`;
                await new Promise((resolve, reject) => {
                    connection.query(queryUpdateDirectorFilm, [directorId, filmId], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
            }
        }

        // Update bảng category_film(nếu có)
        if (categories) {
            for (const category of categories) {
                const queryCategory = `SELECT category_id FROM categorys WHERE category_name = ?`;
                const categoryInfo = await new Promise((resolve, reject) => {
                    connection.query(queryCategory, [category], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
                const categoryId = categoryInfo[0].category_id;
                const queryUpdateCategoryFilm = `UPDATE category_film
                                                SET category_id = ?
                                                WHERE film_id = ?`;
                await new Promise((resolve, reject) => {
                    connection.query(queryUpdateCategoryFilm, [categoryId, filmId], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
            }
        }

        res.status(200).json({
            message: "Film and related records updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Not Found",
            error: error.message
        });
    }
}

// [PATCH] /admin/films/delete/:id
export const deleteFilm = async (req, res) => {
    try {
        const filmId = req.params.id;

        await Promise.all([
            connection.promise().query(`DELETE FROM actor_film WHERE film_id = ?`, [filmId]),
            connection.promise().query(`DELETE FROM director_film WHERE film_id = ?`, [filmId]),
            connection.promise().query(`DELETE FROM category_film WHERE film_id = ?`, [filmId]),
            connection.promise().query(`DELETE FROM films WHERE film_id = ?`, [filmId]),
        ]);

        res.status(200).json({
            message: "Film and related records deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error deleting film",
            error: error.message,
        });
    }
}