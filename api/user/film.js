import express from "express";
import { filmInfo, filmSearchByName, filmShowing, filmShowTimeInfo, getComment, phim, postComment, filmType } from "../../controllers/user/film.js";
const routerFilm = express.Router()
routerFilm.post("/filmShowing" ,filmShowing) 
routerFilm.post("/filmInfo/id=:id",filmInfo)
routerFilm.post("/filmInfo/id=:id/lichChieu/khuVuc_id=:khuVuc_id",filmShowTimeInfo)
routerFilm.post("/filmInfo/getComment/id=:id",getComment)
routerFilm.post("/filmInfo/postComment",postComment)
routerFilm.post("/phim", phim)
routerFilm.post("/searchFilm",filmSearchByName)
routerFilm.post("/category_id=:category_id", filmType)
export default routerFilm;