export interface Request<T = any> {
    id: string;
    type: string;
    payload: T;
    timestamp: number;
    timeout?: number;
}
export interface Response<T = any> {
    requestId: string;
    payload: T;
    error?: Error;
    timestamp: number;
}
export interface RequestHandler<TReq = any, TRes = any> {
    (request: Request<TReq>): Promise<TRes> | TRes;
}
export declare class RequestResponsePattern {
    private static instance;
    private eventSystem;
    private handlers;
    private DEFAULT_TIMEOUT;
    private constructor();
    static getInstance(): RequestResponsePattern;
    registerHandler<TReq = any, TRes = any>(type: string, handler: RequestHandler<TReq, TRes>): void;
    request<TReq = any, TRes = any>(type: string, payload: TReq, timeout?: number): Promise<TRes>;
    private handleRequest;
    private sendResponse;
}
//# sourceMappingURL=RequestResponsePattern.d.ts.map