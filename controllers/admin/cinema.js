import connection from "../../models/SQLConnection.js";

// [GET] /admin/cinemas
export const index = async (req, res) => {
    // SELECT * FROM cinemas;

    // // Lọc theo trạng thái
    // const status = req.query.status;
    // let filmType = '(film_type = 1 OR film_type = 0)';

    // if(status) {
    //     if(status == "Showing") filmType = 'film_type = 1';
    //     else if(status == "Coming") filmType = 'film_type = 0';
    // }
    // // Hết lọc theo trạng thái

    // Tìm kiếm
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%'; // Nếu không có từ khóa, tìm tất cả
    // Hết Tìm kiếm

    // Phân trang
    let limitItems = 200;
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

    const sortKey = req.query.sortKey || "cinema_id";
    const sortValue = req.query.sortValue === "desc" ? "DESC" : "ASC";

    // Hết Sắp xếp theo tiêu chí

    const query = `
        SELECT cinemas.*, cinema_clusters.cluster_name
        FROM cinemas
        JOIN cinema_clusters ON cinemas.cluster_id = cinema_clusters.cluster_id
        WHERE cinema_name LIKE ?
        ORDER BY ${sortKey} ${sortValue}
        LIMIT ?
        OFFSET ?`;

    const cinemas = await new Promise((resolve, reject) => {
        connection.query(query, [keyword, limitItems, skip], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    res.json(cinemas);
};

// [GET] /admin/cinemas/detail/:cinemaId
export const detail = async (req, res) => {
    try {
        const cinemaId = parseInt(req.params.cinemaId);

        const cinemaInfo = {};

        const queryCinema = `Select * from cinemas where cinemas.cinema_id = ?`;
        const cinema = await new Promise((resolve, reject) => {
            connection.query(queryCinema, [cinemaId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        cinemaInfo.cinema = cinema;

        if (cinema.length > 0) {
            const queryCluster = `Select cc.cluster_id,cc.cluster_name
                                from cinema_clusters as cc
                                inner join cinemas as c on cc.cluster_id = c.cluster_id
                                where c.cinema_id = ?`;
            cinemaInfo.clusters = await new Promise((resolve, reject) => {
                connection.query(queryCluster, [cinemaId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const queryRegion = `Select r.region_id,r.region_name
                        from regions as r
                        inner join cinemas as c on r.region_id = c.region_id
                        where c.cinema_id = ?`;
            cinemaInfo.regions = await new Promise((resolve, reject) => {
                connection.query(queryRegion, [cinemaId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            res.json(cinemaInfo);
        }
        else {
            res.json({
                messages: {
                    error: "Cinema not found"
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

// [GET] /admin/cinemas/create
export const create = async (req, res) => {
    try {
        const [clusters] = await connection.promise().query(`SELECT * FROM cinema_clusters`);
        const [regions] = await connection.promise().query(`SELECT * FROM regions`);

        res.json({
            clustersToChoose: clusters,
            regionsToChoose: regions
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creating cinema",
            error: error
        });
    }
}

// [POST] /admin/cinemas/create
export const createPost = async (req, res) => {
    const { cinema_name, cluster_name, region_name, address } = req.body;

    const countResult = await connection.promise().query(
        `SELECT COUNT(*) as count FROM cinemas`,
    );
    const totalCinemas = countResult[0][0].count;
    const cinemaId = totalCinemas + 1;

    // Truy vấn cluster_id từ cluster_name
    const queryCluster = `SELECT cluster_id FROM cinema_clusters WHERE cluster_name = ?`;
    const clusterInfo = await new Promise((resolve, reject) => {
        connection.query(queryCluster, [cluster_name], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
    const clusterId = clusterInfo[0].cluster_id;

    // Truy vấn region_id từ region_name
    const queryRegion = `SELECT region_id FROM regions WHERE region_name = ?`;
    const regionInfo = await new Promise((resolve, reject) => {
        connection.query(queryRegion, [region_name], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
    const regionId = regionInfo[0].region_id;

    // Lưu data vào bảng cinemas
    const queryCinema = `INSERT INTO cinemas 
                        VALUES (?, ?, ?, ?, ?)`;
    const cinema = await new Promise((resolve, reject) => {
        connection.query(queryCinema, [cinemaId, cinema_name, clusterId, regionId, address], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    // Kiểm tra xem bản ghi có được tạo thành công không
    if (cinema) {
        res.status(201).json({
            message: "Cinema created successfully",
            cinemaId: cinema[0], // ID của bản ghi mới được tạo
        });
    } else {
        res.status(500).json({
            message: "Error creating cinema",
        });
    }
}

// [GET] /admin/films/edit/:cinemaId
export const edit = async (req, res) => {
    try {
        const cinemaId = parseInt(req.params.cinemaId);

        const cinemaInfo = {};

        const queryCinema = `Select * from cinemas where cinemas.cinema_id = ?`;
        const cinema = await new Promise((resolve, reject) => {
            connection.query(queryCinema, [cinemaId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        cinemaInfo.cinema = cinema;

        if (cinema.length > 0) {
            const queryCluster = `Select cc.cluster_id,cc.cluster_name
                                from cinema_clusters as cc
                                inner join cinemas as c on cc.cluster_id = c.cluster_id
                                where c.cinema_id = ?`;
            cinemaInfo.clusters = await new Promise((resolve, reject) => {
                connection.query(queryCluster, [cinemaId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const queryRegion = `Select r.region_id,r.region_name
                        from regions as r
                        inner join cinemas as c on r.region_id = c.region_id
                        where c.cinema_id = ?`;
            cinemaInfo.regions = await new Promise((resolve, reject) => {
                connection.query(queryRegion, [cinemaId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const [clusters] = await connection.promise().query(`SELECT * FROM cinema_clusters`);
            const [regions] = await connection.promise().query(`SELECT * FROM regions`);

            res.json({
                cinemaInfo: cinemaInfo,
                clustersToChoose: clusters,
                regionsToChoose: regions
            });
        }
        else {
            res.json({
                messages: {
                    error: "Cinema not found"
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error editing cinema",
            error: error
        });
    }
}

// [PATCH] /admin/cinemas/edit/:cinemaId
export const editPatch = async (req, res) => {
    try {
        const cinemaId = parseInt(req.params.cinemaId);

        const { cinema_name, cluster_name, region_name, address } = req.body;

        // Truy vấn cluster_id từ cluster_name
        const queryCluster = `SELECT cluster_id FROM cinema_clusters WHERE cluster_name = ?`;
        const clusterInfo = await new Promise((resolve, reject) => {
            connection.query(queryCluster, [cluster_name], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        const clusterId = clusterInfo[0].cluster_id;

        // Truy vấn region_id từ region_name
        const queryRegion = `SELECT region_id FROM regions WHERE region_name = ?`;
        const regionInfo = await new Promise((resolve, reject) => {
            connection.query(queryRegion, [region_name], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        const regionId = regionInfo[0].region_id;

        const queryUpdateCinema =
            `UPDATE cinemas
            SET cinema_name = ?, cluster_id = ?, region_id = ?, address = ?
            WHERE cinema_id = ?`;
        await new Promise((resolve, reject) => {
            connection.query(queryUpdateCinema, [cinema_name, clusterId, regionId, address, cinemaId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        res.status(200).json({
            message: "Cinema updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Not Found",
            error: error.message
        });
    }
}

// [DELETE] /admin/cinemas/delete/:cinemaId
export const deleteItem = async (req, res) => {
    try {
        const cinemaId = req.params.cinemaId;

        if (!cinemaId) {
            return res.status(400).json({
                message: "No cinema ID provided",
            });
        }

        const queryDeleteCinema = `DELETE FROM cinemas WHERE cinema_id = ?`;

        await new Promise((resolve, reject) => {
            connection.query(queryDeleteCinema, [cinemaId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        res.status(200).json({
            message: `Cinema with ID ${cinemaId} deleted successfully`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error deleting cinema",
            error: error.message,
        });
    }
};
