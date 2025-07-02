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
// GET /api/quotes
router.get('/', auth_1.isAuthenticated, async (req, res, next) => {
    try {
        const [quotes] = await db_1.default.query('SELECT * FROM quotes ORDER BY createdAt DESC');
        const quoteIds = quotes.map(q => q.id);
        if (quoteIds.length === 0) {
            return res.json([]);
        }
        const [items] = await db_1.default.query('SELECT * FROM quote_items WHERE quoteId IN (?)', [quoteIds]);
        const quotesWithItems = quotes.map(quote => ({
            ...quote,
            items: items.filter(item => item.quoteId === quote.id)
        }));
        res.json(quotesWithItems);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/quotes/:id
router.get('/:id', auth_1.isAuthenticated, async (req, res, next) => {
    const { id } = req.params;
    try {
        const [quotes] = await db_1.default.query('SELECT * FROM quotes WHERE id = ?', [id]);
        if (quotes.length === 0) {
            return res.status(404).json({ message: 'Quote not found.' });
        }
        const [items] = await db_1.default.query('SELECT * FROM quote_items WHERE quoteId = ?', [id]);
        res.json({ ...quotes[0], items });
    }
    catch (error) {
        next(error);
    }
});
// Helper function to save a quote
const saveQuote = async (quoteData, user) => {
    const conn = await db_1.default.getConnection();
    try {
        await conn.beginTransaction();
        const { items, ...mainQuoteData } = quoteData;
        if (quoteData.id) { // Update
            // Remove old items
            await conn.query('DELETE FROM quote_items WHERE quoteId = ?', [quoteData.id]);
            await conn.query('UPDATE quotes SET ? WHERE id = ?', [mainQuoteData, quoteData.id]);
        }
        else { // Create
            const newId = (0, utils_1.generateId)();
            mainQuoteData.id = newId;
            // Get latest quote number and increment
            const [lastQuote] = await conn.query("SELECT quoteNumber FROM quotes ORDER BY CAST(quoteNumber AS UNSIGNED) DESC, quoteNumber DESC LIMIT 1");
            const nextNumber = lastQuote.length > 0 ? parseInt(lastQuote[0].quoteNumber, 10) + 1 : 1;
            mainQuoteData.quoteNumber = nextNumber.toString().padStart(4, '0');
            // Get company info snapshot
            const [companyRows] = await conn.query('SELECT * FROM company_info LIMIT 1');
            if (companyRows.length === 0) {
                throw new Error("Company information has not been set up. Cannot create a quote snapshot.");
            }
            mainQuoteData.companyInfoSnapshot = companyRows[0];
            mainQuoteData.salespersonUsername = user.username;
            mainQuoteData.salespersonFullName = user.fullName;
            await conn.query('INSERT INTO quotes SET ?', [mainQuoteData]);
        }
        // Insert new items
        if (items && items.length > 0) {
            for (const item of items) {
                const { ...itemData } = item;
                await conn.query('INSERT INTO quote_items SET ?', { ...itemData, quoteId: mainQuoteData.id });
            }
        }
        await conn.commit();
        // Fetch the full quote to return
        const [newQuotes] = await conn.query('SELECT * FROM quotes WHERE id = ?', [mainQuoteData.id]);
        const [newItems] = await conn.query('SELECT * FROM quote_items WHERE quoteId = ?', [mainQuoteData.id]);
        return { ...newQuotes[0], items: newItems };
    }
    catch (error) {
        await conn.rollback();
        throw error;
    }
    finally {
        conn.release();
    }
};
// POST /api/quotes
router.post('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    try {
        const user = req.session.user;
        const newQuote = await saveQuote(req.body, user);
        res.status(201).json(newQuote);
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/quotes/:id
router.put('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const { id } = req.params;
    const quoteData = { ...req.body, id };
    try {
        const user = req.session.user;
        const updatedQuote = await saveQuote(quoteData, user);
        res.json(updatedQuote);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
