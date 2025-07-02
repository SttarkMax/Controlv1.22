"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const utils_1 = require("../utils");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const conn = await db_1.default.getConnection();
        // Check if any user exists. If not, create the default admin user.
        const [userRows] = await conn.query('SELECT id FROM users LIMIT 1');
        if (userRows.length === 0 && username === 'admin' && password === 'admin') {
            const adminId = (0, utils_1.generateId)();
            const adminHashedPassword = await (0, utils_1.hashPassword)('admin');
            const adminUser = {
                id: adminId,
                username: 'admin',
                fullName: 'Administrador',
                password: adminHashedPassword,
                role: types_1.UserAccessLevel.ADMIN
            };
            await conn.query('INSERT INTO users SET ?', adminUser);
            console.log('Default admin user created.');
        }
        const [rows] = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
        conn.release();
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        const user = rows[0];
        const passwordMatch = await (0, utils_1.comparePassword)(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        // Don't store password in session
        const loggedInUser = {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role
        };
        req.session.user = loggedInUser;
        res.json(loggedInUser);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.status(204).send();
    });
});
// GET /api/auth/me (Check session)
router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        return res.json(req.session.user);
    }
    return res.status(401).json({ message: 'Not authenticated' });
});
exports.default = router;
