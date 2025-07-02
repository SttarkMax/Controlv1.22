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
const requiredRoles = [types_1.UserAccessLevel.ADMIN, types_1.UserAccessLevel.SALES];
// GET /api/categories
router.get('/', auth_1.isAuthenticated, async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/categories
router.post('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const category = req.body;
    category.id = (0, utils_1.generateId)();
    try {
        await db_1.default.query('INSERT INTO categories SET ?', [category]);
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/categories/:id
router.put('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const { id } = req.params;
    const category = req.body;
    try {
        await db_1.default.query('UPDATE categories SET ? WHERE id = ?', [category, id]);
        res.json(category);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/categories/:id
router.delete('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const { id } = req.params;
    try {
        await db_1.default.query('DELETE FROM categories WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
