"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv = __importStar(require("dotenv"));
const MultiAgentCoordinator_1 = require("./core/multiagent/MultiAgentCoordinator");
dotenv.config();
const PORT = Number(process.env.PORT || 3000);
async function main() {
    const coordinator = MultiAgentCoordinator_1.MultiAgentCoordinator.getInstance();
    const initialized = await coordinator.initialize();
    if (!initialized) {
        throw new Error('Failed to initialize coordinator');
    }
    const started = await coordinator.start();
    if (!started) {
        throw new Error('Failed to start coordinator');
    }
    const server = http_1.default.createServer(async (_req, res) => {
        if (_req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
            return;
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    });
    server.listen(PORT, () => {
        console.info(`NoOrg coordinator listening on port ${PORT}`);
    });
    const shutdown = async () => {
        console.info('Shutting down...');
        await coordinator.stop();
        server.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
main().catch((err) => {
    console.error('Fatal error starting coordinator', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map