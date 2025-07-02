"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
// GET /api/users
router.get('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query('SELECT id, username, fullName, role FROM users ORDER BY fullName ASC');
        res.json(rows);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/users
router.post('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const { username, fullName, password, role } = req.body;
    if (!password) {
        return res.status(400).json({ message: 'Password is required for new users.' });
    }
    try {
        const hashedPassword = await (0, utils_1.hashPassword)(password);
        const newUser = {
            id: (0, utils_1.generateId)(),
            username,
            fullName,
            password: hashedPassword,
            role,
        };
        await db_1.default.query('INSERT INTO users SET ?', [newUser]);
        delete newUser.password; // Don't return password
        res.status(201).json(newUser);
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        next(error);
    }
});
// PUT /api/users/:id
router.put('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const { id } = req.params;
    const { fullName, password, role } = req.body;
    try {
        const updates = { fullName, role };
        if (password) {
            updates.password = await (0, utils_1.hashPassword)(password);
        }
        await db_1.default.query('UPDATE users SET ? WHERE id = ?', [updates, id]);
        const [updatedUserRows] = await db_1.default.query('SELECT id, username, fullName, role FROM users WHERE id = ?', [id]);
        res.json(updatedUserRows[0]);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/users/:id
router.delete('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const { id } = req.params;
    if (id === req.session.user?.id) {
        return res.status(400).json({ message: 'You cannot delete yourself.' });
    }
    try {
        // Prevent deleting the last admin
        const [admins] = await db_1.default.query('SELECT id FROM users WHERE role = ?', [types_1.UserAccessLevel.ADMIN]);
        if (admins.length === 1 && admins[0].id === id) {
            return res.status(400).json({ message: 'Cannot delete the last administrator.' });
        }
        await db_1.default.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
