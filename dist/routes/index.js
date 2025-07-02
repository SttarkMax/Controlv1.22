"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const companyInfo_routes_1 = __importDefault(require("./companyInfo.routes"));
const products_routes_1 = __importDefault(require("./products.routes"));
const categories_routes_1 = __importDefault(require("./categories.routes"));
const customers_routes_1 = __importDefault(require("./customers.routes"));
const quotes_routes_1 = __importDefault(require("./quotes.routes"));
const users_routes_1 = __importDefault(require("./users.routes"));
const accountsPayable_routes_1 = __importDefault(require("./accountsPayable.routes"));
const suppliers_routes_1 = __importDefault(require("./suppliers.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/company-info', companyInfo_routes_1.default);
router.use('/products', products_routes_1.default);
router.use('/categories', categories_routes_1.default);
router.use('/customers', customers_routes_1.default);
router.use('/quotes', quotes_routes_1.default);
router.use('/users', users_routes_1.default);
router.use('/accounts-payable', accountsPayable_routes_1.default);
router.use('/suppliers', suppliers_routes_1.default);
// These are combined into the suppliers route
// router.use('/debts', debtsRouter); 
// router.use('/supplier-credits', supplierCreditsRouter);
exports.default = router;
