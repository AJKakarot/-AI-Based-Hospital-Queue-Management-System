/**
 * @typedef {Object} SymptomCheckerResponse
 * @property {string} recommendedDoctor
 * @property {"Low" | "Medium" | "High"} urgencyLevel
 * @property {string} reason
 * @property {string[]} selfCareTips
 * @property {string} disclaimer
 */

/**
 * @typedef {Object} SymptomCheckerRequest
 * @property {string} symptoms
 */

export {};
