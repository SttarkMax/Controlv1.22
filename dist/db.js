"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true, // Keep dates as strings to avoid timezone issues
});
pool.getConnection()
    .then(connection => {
    console.log('✅ Successfully connected to the MySQL database.');
    connection.release();
})
    .catch(error => {
    console.error('❌ Error connecting to the MySQL database:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
        console.error(`Database '${process.env.DB_NAME}' not found. Please create it first.`);
    }
    else if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused. Is the MySQL server running?');
    }
    else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('Access denied. Please check your DB_USER and DB_PASSWORD in the .env file.');
    }
});
exports.default = pool;
