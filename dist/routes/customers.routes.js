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
// GET /api/customers
router.get('/', auth_1.isAuthenticated, async (req, res, next) => {
    try {
        const [customers] = await db_1.default.query('SELECT * FROM customers ORDER BY name ASC');
        const [downPayments] = await db_1.default.query('SELECT * FROM down_payment_entries');
        const customersWithPayments = customers.map(customer => {
            return {
                ...customer,
                downPayments: downPayments.filter(dp => dp.customerId === customer.id)
            };
        });
        res.json(customersWithPayments);
    }
    catch (error) {
        next(error);
    }
});
// Shared function to save a customer (create or update)
const saveCustomer = async (customer) => {
    const { downPayments, ...customerData } = customer;
    const conn = await db_1.default.getConnection();
    try {
        await conn.beginTransaction();
        if (customerData.id) {
            await conn.query('UPDATE customers SET ? WHERE id = ?', [customerData, customerData.id]);
            // Clear old down payments for this customer and insert new ones
            await conn.query('DELETE FROM down_payment_entries WHERE customerId = ?', [customerData.id]);
        }
        else {
            customerData.id = (0, utils_1.generateId)();
            await conn.query('INSERT INTO customers SET ?', [customerData]);
        }
        if (downPayments && downPayments.length > 0) {
            for (const payment of downPayments) {
                const paymentEntry = {
                    id: (0, utils_1.generateId)(),
                    customerId: customerData.id,
                    amount: payment.amount,
                    date: payment.date,
                    description: payment.description,
                };
                await conn.query('INSERT INTO down_payment_entries SET ?', [paymentEntry]);
            }
        }
        await conn.commit();
        return { ...customerData, downPayments: downPayments || [] };
    }
    catch (error) {
        await conn.rollback();
        throw error;
    }
    finally {
        conn.release();
    }
};
// POST /api/customers
router.post('/', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const customerData = { id: '', ...req.body }; // Ensure ID is empty for creation
    try {
        const newCustomer = await saveCustomer(customerData);
        res.status(201).json(newCustomer);
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/customers/:id
router.put('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const { id } = req.params;
    const customerData = { ...req.body, id };
    try {
        const updatedCustomer = await saveCustomer(customerData);
        res.json(updatedCustomer);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/customers/:id
router.delete('/:id', auth_1.isAuthenticated, (0, auth_1.hasRole)(requiredRoles), async (req, res, next) => {
    const { id } = req.params;
    try {
        // The database schema uses ON DELETE CASCADE for down_payment_entries and quotes
        await db_1.default.query('DELETE FROM customers WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
