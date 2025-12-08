"use strict";
/**
 * Core interfaces for organizational units
 *
 * This file defines the fundamental types and interfaces for working with
 * organizational units in a multi-agent system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipType = void 0;
/**
 * Types of relationships between organizational units
 */
var RelationshipType;
(function (RelationshipType) {
    RelationshipType["HIERARCHY"] = "hierarchy";
    RelationshipType["COLLABORATION"] = "collaboration";
    RelationshipType["ADVISORY"] = "advisory";
    RelationshipType["SERVICE"] = "service";
    RelationshipType["REPORTING"] = "reporting";
    RelationshipType["LINK"] = "link";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
//# sourceMappingURL=UnitInterface.js.map