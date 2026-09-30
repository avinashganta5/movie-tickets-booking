const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "sweety",
    password: process.env.DB_PASSWORD || "Sweety@123",
    database: process.env.DB_NAME || "movie_booking",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

async function testConnection() {
    const connection = await promisePool.getConnection();

    try {
        await connection.query("SELECT 1");
        console.log("MySQL database connected successfully.");
    } finally {
        connection.release();
    }
}

module.exports = {
    pool: promisePool,
    testConnection
};
