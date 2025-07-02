"use strict";
// This file is a copy of the frontend types.ts to ensure consistency.
// In a monorepo setup, this would be a shared package.
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccessLevel = exports.PricingModel = void 0;
var PricingModel;
(function (PricingModel) {
    PricingModel["PER_UNIT"] = "unidade";
    PricingModel["PER_SQUARE_METER"] = "m2";
})(PricingModel || (exports.PricingModel = PricingModel = {}));
var UserAccessLevel;
(function (UserAccessLevel) {
    UserAccessLevel["ADMIN"] = "admin";
    UserAccessLevel["SALES"] = "sales";
    UserAccessLevel["VIEWER"] = "viewer";
})(UserAccessLevel || (exports.UserAccessLevel = UserAccessLevel = {}));
