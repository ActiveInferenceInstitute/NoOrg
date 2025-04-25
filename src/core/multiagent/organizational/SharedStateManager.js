// Placeholder for Shared State Manager Logic
const { PlanDocument } = require('./types');

class SharedStateManager {
    constructor() {
        this.state = {}; // General key-value store
        this.planDocument = null; // Specific store for the main plan
    }

    initializePlan(planTitle) {
        if (this.planDocument) {
            console.warn("Plan document already initialized. Overwriting.");
        }
        this.planDocument = new PlanDocument({ title: planTitle });
        console.log(`📄 Initialized Plan Document: ${planTitle}`);
        return this.planDocument;
    }

    getPlanDocument() {
        if (!this.planDocument) {
            // Consider whether to throw error or return null based on expected usage
            console.warn("Attempted to get plan document before initialization.");
            return null; 
        }
        return this.planDocument;
    }
    
    // Method to update plan sections, delegates to PlanDocument instance
    updatePlanSection(sectionData) { // Expects { sectionTitle, content, unitId }
         const plan = this.getPlanDocument();
         if (plan) {
             plan.addOrUpdateSection(sectionData);
         } else {
             console.error("Cannot update plan section: Plan document not initialized.");
         }
    }

    // General state methods (like in demo)
    setState(key, value) {
        const keys = key.split('.');
        let current = this.state;
        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = current[keys[i]] || {};
            current = current[keys[i]];
        }
        const oldValue = current[keys[keys.length - 1]];
        current[keys[keys.length - 1]] = value;
        const valuePreview = (typeof value === 'string' && value.length > 100) ? value.substring(0, 100) + '...' : (typeof value === 'object' ? '[Object]' : value);
        console.log(`💾 Shared State updated: ${key} = ${valuePreview}`);
        return oldValue; 
    }

    getState(key, defaultValue = undefined) {
        const keys = key.split('.');
        let current = this.state;
        for (const k of keys) {
            if (current === null || current === undefined || !current.hasOwnProperty(k)) {
                return defaultValue;
            }
            current = current[k];
        }
        return current;
    }

    appendState(key, value) {
        const keys = key.split('.');
        let current = this.state;
        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = current[keys[i]] || {};
            current = current[keys[i]];
        }
        const arrKey = keys[keys.length - 1];
        if (!Array.isArray(current[arrKey])) {
            current[arrKey] = [];
        }
        current[arrKey].push(value);
        console.log(`💾 Shared State appended to: ${key}`);
    }

    getAllState() {
        // Combine general state and plan document state for a complete view
        return {
            general: this.state,
            plan: this.planDocument ? this.planDocument : null // Or serialize plan differently
        };
    }
}

module.exports = SharedStateManager; 