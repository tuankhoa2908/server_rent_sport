const { default: mongoose } = require("mongoose");
const url = process.env.MONGO_URL;
const options = {
    maxPoolSize: 20,
    socketTimeoutMS: 30000,
    // autoIndex: false,
    // user: "tuankhoa2908",
    // pass: "khoatrum0175",
    dbName: "rent-sport",
};

const dbConnect = async () => {
    const conn = await mongoose
        .connect(url, options)
        .then(
            () => {
                console.log(`Database ${options.dbName} connect successfull`)
            }
        )
        .catch((err) => {
            console.log(err)
        })
}

module.exports = dbConnect;