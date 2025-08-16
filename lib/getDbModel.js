import mongoose from "mongoose";
import bannerSchema from "@/models/Banner";
import eventSchema from "@/models/Events";
import aboutSchema from "@/models/About";
import labSchema from "@/models/Labs";
import programSchema from "@/models/Programs";
import dcSchema from "@/models/DC";

// DC Model (Centralized)
export const getDbAndDCModel = () => {
    const db = mongoose.connection.useDb("DC");
    const Dc = db.models.Dc || db.model("Dc", dcSchema);
    return { db, Dc };
};

// Banner (shared naming)
export const getDbAndBannerModel = (department) => {
    if (!department) throw new Error("Department is required to access banner model");

    const db = mongoose.connection.useDb(department.toLowerCase());
    const Banner = db.models.Banner || db.model("Banner", bannerSchema);
    return { db, Banner };
};

// Event with dynamic model and bucket name
export const getDbAndEventModel = (department) => {
    if (!department) throw new Error("Department is required to access event model");

    const dbName = department.toLowerCase();
    const modelName = `${department}_Event`;
    const bucketName = `${dbName}_events`;

    const db = mongoose.connection.useDb(dbName);
    const Event = db.models[modelName] || db.model(modelName, eventSchema);
    const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName });

    return { db, Event, gfs, bucketName };
};

// About with dynamic model and bucket name
export const getDbAndAboutModel = (department) => {
    if (!department) throw new Error("Department is required to access about model");

    const dbName = department.toLowerCase();
    const modelName = `${department}_About`;
    const bucketName = `${dbName}_about`;

    const db = mongoose.connection.useDb(dbName);
    const About = db.models[modelName] || db.model(modelName, aboutSchema);
    const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName });

    return { db, About, gfs, bucketName };
};

// Lab with dynamic model and bucket name
export const getDbAndLabModel = (department) => {
    if (!department) throw new Error("Department is required to access lab model");

    const dbName = department.toLowerCase();
    const modelName = `${department}_Lab`;
    const bucketName = `${dbName}_labs`;

    const db = mongoose.connection.useDb(dbName);
    const Lab = db.models[modelName] || db.model(modelName, labSchema);
    const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName });

    return { db, Lab, gfs, bucketName };
};

// Program (model only, no bucket)
export const getDbAndProgramModel = (department) => {
    if (!department) throw new Error("Department is required to access program model");

    const dbName = department.toLowerCase();
    const modelName = `${department}_Program`;

    const db = mongoose.connection.useDb(dbName);
    const Program = db.models[modelName] || db.model(modelName, programSchema);

    return { db, Program };
};
