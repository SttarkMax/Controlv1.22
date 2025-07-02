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
// GET /api/company-info
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query('SELECT * FROM company_info LIMIT 1');
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Company information not found.' });
        }
        res.json(rows[0]);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/company-info (Create or Update)
router.post('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(types_1.UserAccessLevel.ADMIN), async (req, res, next) => {
    const companyData = req.body;
    try {
        const [rows] = await db_1.default.query('SELECT id FROM company_info LIMIT 1');
        if (rows.length > 0) {
            // Update existing record
            const existingId = rows[0].id;
            await db_1.default.query('UPDATE company_info SET ? WHERE id = ?', [companyData, existingId]);
            res.json({ ...companyData, id: existingId });
        }
        else {
            // Insert new record
            const newId = companyData.id || (0, utils_1.generateId)();
            const dataToInsert = { ...companyData, id: newId };
            await db_1.default.query('INSERT INTO company_info SET ?', dataToInsert);
            res.status(201).json(dataToInsert);
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
