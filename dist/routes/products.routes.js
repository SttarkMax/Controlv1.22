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
// GET /api/products
router.get('/', auth_1.isAuthenticated, async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM products ORDER BY name ASC');
        res.json(rows);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/products
router.post('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const product = req.body;
    product.id = (0, utils_1.generateId)();
    try {
        await db_1.default.query('INSERT INTO products SET ?', [product]);
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/products/:id
router.put('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const { id } = req.params;
    const product = req.body;
    try {
        await db_1.default.query('UPDATE products SET ? WHERE id = ?', [product, id]);
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/products/:id
router.delete('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const { id } = req.params;
    try {
        await db_1.default.query('DELETE FROM products WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
