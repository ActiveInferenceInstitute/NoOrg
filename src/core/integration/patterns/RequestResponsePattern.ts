import { EventSystem } from '../../events/EventSystem';
import * as crypto from 'crypto';

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

export class RequestResponsePattern {
  private static instance: RequestResponsePattern;
  private eventSystem: EventSystem;
  private handlers: Map<string, RequestHandler>;
  private DEFAULT_TIMEOUT = 30000; // 30 seconds

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.handlers = new Map();

    // Listen for request events
    this.eventSystem.on('request', async (event) => {
      const request = event.payload as Request;
      await this.handleRequest(request);
    });
  }

  public static getInstance(): RequestResponsePattern {
    if (!RequestResponsePattern.instance) {
      RequestResponsePattern.instance = new RequestResponsePattern();
    }
    return RequestResponsePattern.instance;
  }

  public registerHandler<TReq = any, TRes = any>(
    type: string,
    handler: RequestHandler<TReq, TRes>
  ): void {
    this.handlers.set(type, handler);
  }

  public async request<TReq = any, TRes = any>(
    type: string,
    payload: TReq,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<TRes> {
    const request: Request<TReq> = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      timeout
    };

    return new Promise((resolve, reject) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request ${request.id} timed out after ${timeout}ms`));
      }, timeout);

      // Listen for response
      const responseHandler = (event: any) => {
        const response = event.payload as Response<TRes>;
        if (response.requestId === request.id) {
          clearTimeout(timeoutId);
          this.eventSystem.off(`response:${request.id}`, responseHandler);
          
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.payload);
          }
        }
      };

      this.eventSystem.on(`response:${request.id}`, responseHandler);
      this.eventSystem.emit('request', request);
    });
  }

  private async handleRequest(request: Request): Promise<void> {
    const handler = this.handlers.get(request.type);
    if (!handler) {
      this.sendResponse(request.id, undefined, new Error(`No handler registered for request type: ${request.type}`));
      return;
    }

    try {
      const result = await handler(request);
      this.sendResponse(request.id, result);
    } catch (error) {
      this.sendResponse(request.id, undefined, error as Error);
    }
  }

  private sendResponse(requestId: string, payload?: any, error?: Error): void {
    const response: Response = {
      requestId,
      payload,
      error,
      timestamp: Date.now()
    };
    this.eventSystem.emit(`response:${requestId}`, response);
  }
} 