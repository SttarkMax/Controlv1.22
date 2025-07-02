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
const adminAndSales = [types_1.UserAccessLevel.ADMIN, types_1.UserAccessLevel.SALES];
// --- Suppliers ---
router.get('/', auth_1.isAuthenticated, async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM suppliers ORDER BY name ASC');
        res.json(rows);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(adminAndSales), async (req, res, next) => {
    const supplier = { id: (0, utils_1.generateId)(), ...req.body };
    try {
        await db_1.default.query('INSERT INTO suppliers SET ?', [supplier]);
        res.status(201).json(supplier);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(adminAndSales), async (req, res, next) => {
    const { id } = req.params;
    const supplier = req.body;
    try {
        await db_1.default.query('UPDATE suppliers SET ? WHERE id = ?', [supplier, id]);
        res.json(supplier);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(adminAndSales), async (req, res, next) => {
    const { id } = req.params;
    try {
        await db_1.default.query('DELETE FROM suppliers WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// --- Debts ---
router.get('/debts', auth_1.isAuthenticated, async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM supplier_debts ORDER BY dateAdded DESC');
        res.json(rows);
    }
    catch (error) {
        next(error);
    }
});
router.post('/debts', auth_1.isAuthenticated, (0, auth_1.hasRole)(adminAndSales), async (req, res, next) => {
    const debt = { id: (0, utils_1.generateId)(), ...req.body };
    try {
        await db_1.default.query('INSERT INTO supplier_debts SET ?', [debt]);
        res.status(201).json(debt);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/debts/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(adminAndSales), async (req, res, next) => {
    const { id } = req.params;
    try {
        await db_1.default.query('DELETE FROM supplier_debts WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// --- Supplier Credits (Payments) ---
router.get('/supplier-credits', auth_1.isAuthenticated, async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM supplier_credits ORDER BY date DESC');
        res.json(rows);
    }
    catch (error) {
        next(error);
    }
});
router.post('/supplier-credits', auth_1.isAuthenticated, (0, auth_1.hasRole)(adminAndSales), async (req, res, next) => {
    const credit = { id: (0, utils_1.generateId)(), ...req.body };
    try {
        await db_1.default.query('INSERT INTO supplier_credits SET ?', [credit]);
        res.status(201).json(credit);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/supplier-credits/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(adminAndSales), async (req, res, next) => {
    const { id } = req.params;
    try {
        await db_1.default.query('DELETE FROM supplier_credits WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
