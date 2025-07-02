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
// GET /api/accounts-payable
router.get('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM accounts_payable_entries ORDER BY dueDate ASC');
        res.json(rows);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/accounts-payable
router.post('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const entry = req.body;
    const newEntry = {
        ...entry,
        id: (0, utils_1.generateId)(),
        createdAt: new Date().toISOString()
    };
    try {
        await db_1.default.query('INSERT INTO accounts_payable_entries SET ?', [newEntry]);
        res.status(201).json(newEntry);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/accounts-payable/series
router.post('/series', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const { baseEntry, installments, frequency } = req.body;
    const seriesId = (0, utils_1.generateId)();
    const installmentAmount = baseEntry.amount / installments;
    const startDate = new Date(baseEntry.dueDate);
    const createdEntries = [];
    const conn = await db_1.default.getConnection();
    try {
        await conn.beginTransaction();
        for (let i = 0; i < installments; i++) {
            let dueDate;
            if (frequency === 'monthly') {
                dueDate = (0, utils_1.addMonths)(startDate, i);
            }
            else { // weekly
                dueDate = (0, utils_1.addWeeks)(startDate, i);
            }
            const entry = {
                id: (0, utils_1.generateId)(),
                name: `${baseEntry.name} (${i + 1}/${installments})`,
                amount: installmentAmount,
                dueDate: (0, utils_1.formatDateForDb)(dueDate),
                isPaid: baseEntry.isPaid,
                createdAt: new Date().toISOString(),
                notes: baseEntry.notes,
                seriesId: seriesId,
                totalInstallmentsInSeries: installments,
                installmentNumberOfSeries: i + 1,
            };
            await conn.query('INSERT INTO accounts_payable_entries SET ?', [entry]);
            createdEntries.push(entry);
        }
        await conn.commit();
        res.status(201).json(createdEntries);
    }
    catch (error) {
        await conn.rollback();
        next(error);
    }
    finally {
        conn.release();
    }
});
// PUT /api/accounts-payable/:id
router.put('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const { id } = req.params;
    const entry = req.body;
    try {
        await db_1.default.query('UPDATE accounts_payable_entries SET ? WHERE id = ?', [entry, id]);
        res.json(entry);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/accounts-payable/:id/toggle-paid
router.post('/:id/toggle-paid', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const { id } = req.params;
    try {
        await db_1.default.query('UPDATE accounts_payable_entries SET isPaid = NOT isPaid WHERE id = ?', [id]);
        const [rows] = await db_1.default.query('SELECT * FROM accounts_payable_entries WHERE id = ?', [id]);
        res.json(rows[0]);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/accounts-payable/:id
router.delete('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const { id } = req.params;
    try {
        await db_1.default.query('DELETE FROM accounts_payable_entries WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/accounts-payable/series/:seriesId
router.delete('/series/:seriesId', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const { seriesId } = req.params;
    try {
        await db_1.default.query('DELETE FROM accounts_payable_entries WHERE seriesId = ?', [seriesId]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
