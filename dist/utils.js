"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateForDb = exports.addWeeks = exports.addMonths = exports.comparePassword = exports.hashPassword = exports.generateId = void 0;
const nanoid_1 = require("nanoid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
const generateId = () => (0, nanoid_1.nanoid)();
exports.generateId = generateId;
const hashPassword = async (password) => {
    return await bcrypt_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return await bcrypt_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== date.getDate()) {
        d.setDate(0);
    }
    return d;
};
exports.addMonths = addMonths;
const addWeeks = (date, weeks) => {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
};
exports.addWeeks = addWeeks;
const formatDateForDb = (date) => {
    return date.toISOString().split('T')[0];
};
exports.formatDateForDb = formatDateForDb;
