import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  CircuitBreaker, 
  Timeout, 
  Retry, 
  Bulkhead, 
  RateLimiter 
} from '../../src/core/integration/patterns';
import { EventSystem } from '../../src/core/events/EventSystem';

/**
 * A resilient API client that combines multiple integration patterns
 * for maximum reliability and protection.
 */
export class ResilientApiClient {
  private circuitBreaker: CircuitBreaker;
  private timeout: Timeout;
  private retry: Retry;
  private bulkhead: Bulkhead;
  private rateLimiter: RateLimiter;
  private eventSystem: EventSystem;

  constructor(
    private baseUrl: string,
    private options: {
      circuitBreaker?: {
        failureThreshold?: number;
        resetTimeout?: number;
      };
      timeout?: {
        timeout?: number;
      };
      retry?: {
        maxAttempts?: number;
        initialDelay?: number;
        backoffFactor?: number;
      };
      bulkhead?: {
        maxConcurrent?: number;
        maxQueue?: number;
      };
      rateLimiter?: {
        requestsPerPeriod?: number;
        periodInMs?: number;
      };
    } = {}
  ) {
    this.eventSystem = EventSystem.getInstance();
    
    // Set up all resilience patterns
    this.circuitBreaker = CircuitBreaker.getBreaker('api-client', options.circuitBreaker || {});
    
    // For Timeout, ensure timeout is set (required property)
    this.timeout = new Timeout('api-client', {
      timeout: options.timeout?.timeout || 5000 // Default 5 seconds
    });
    
    this.retry = Retry.getRetrier('api-client', {
      ...(options.retry || {}),
      retryableErrors: [
        'ECONNREFUSED', 
        'ECONNRESET', 
        'ETIMEDOUT',
        'socket hang up', 
        'Network Error',
        /^5\d\d$/  // Retry on 5xx status codes
      ]
    });
    
    // For Bulkhead, ensure required properties are set
    this.bulkhead = new Bulkhead('api-client', {
      maxConcurrent: options.bulkhead?.maxConcurrent || 10,
      maxQueue: options.bulkhead?.maxQueue || 30
    });
    
    this.rateLimiter = RateLimiter.getLimiter('api-client', options.rateLimiter || {});

    // Set up monitoring
    this.setupMonitoring();
  }

  /**
   * Make a resilient GET request to the API
   */
  public async get<T = any>(
    path: string, 
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: 'get',
      url: `${this.baseUrl}${path}`,
      ...config
    });
  }

  /**
   * Make a resilient POST request to the API
   */
  public async post<T = any>(
    path: string, 
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: 'post',
      url: `${this.baseUrl}${path}`,
      data,
      ...config
    });
  }

  /**
   * Make a resilient PUT request to the API
   */
  public async put<T = any>(
    path: string, 
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: 'put',
      url: `${this.baseUrl}${path}`,
      data,
      ...config
    });
  }

  /**
   * Make a resilient DELETE request to the API
   */
  public async delete<T = any>(
    path: string, 
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: 'delete',
      url: `${this.baseUrl}${path}`,
      ...config
    });
  }

  /**
   * Core request method that applies all resilience patterns
   */
  private async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Apply patterns in a specific order:
    // 1. Rate Limiter - Control request rate to not overwhelm the API
    // 2. Circuit Breaker - Prevent calls if API is experiencing issues
    // 3. Bulkhead - Limit concurrent requests
    // 4. Timeout - Ensure requests don't hang indefinitely
    // 5. Retry - Retry failed requests with backoff

    const requestFn = async (): Promise<AxiosResponse<T>> => {
      try {
        return await axios.request<T>(config);
      } catch (error) {
        // Transform axios error to include status code in error message
        // This helps the retry pattern match on HTTP status codes
        if (error.response?.status) {
          error.message = `${error.response.status}: ${error.message}`;
        }
        throw error;
      }
    };

    // Apply all patterns in sequence
    return this.rateLimiter.execute(() => 
      this.circuitBreaker.execute(() => 
        this.bulkhead.execute(() => 
          this.timeout.execute(() => 
            this.retry.execute(requestFn)
          )
        )
      )
    );
  }

  /**
   * Set up event listeners for monitoring
   */
  private setupMonitoring(): void {
    // Circuit breaker events
    this.eventSystem.on('circuit:state_change', (event) => {
      console.log(`[Circuit Breaker] State changed to ${event.payload.state.status}`);
    });

    // Bulkhead events
    this.eventSystem.on('bulkhead:rejected', (event) => {
      console.warn(`[Bulkhead] Request rejected, queue full`);
    });

    // Timeout events
    this.eventSystem.on('timeout:exceeded', (event) => {
      console.warn(`[Timeout] Request timed out after ${event.payload.timeoutMs}ms`);
    });

    // Retry events
    this.eventSystem.on('retry:attempt', (event) => {
      console.log(`[Retry] Attempt ${event.payload.attempt} after error: ${event.payload.error.message}`);
    });

    // Rate limiter events
    this.eventSystem.on('rate_limiter:queued', (event) => {
      console.log(`[Rate Limiter] Request queued, current queue size: ${event.payload.queueLength}`);
    });
  }

  /**
   * Clean up resources when client is no longer needed
   */
  public dispose(): void {
    this.circuitBreaker.dispose();
    this.bulkhead.dispose();
    this.rateLimiter.dispose();
  }
}

// Example usage
async function exampleUsage() {
  const api = new ResilientApiClient('https://api.example.com', {
    circuitBreaker: {
      failureThreshold: 3,
      resetTimeout: 10000, // 10 seconds
    },
    timeout: {
      timeout: 3000, // 3 seconds
    },
    retry: {
      maxAttempts: 3,
      initialDelay: 500,
      backoffFactor: 2,
    },
    bulkhead: {
      maxConcurrent: 5,
      maxQueue: 10,
    },
    rateLimiter: {
      requestsPerPeriod: 10,
      periodInMs: 1000, // 1 second
    },
  });

  try {
    // Make parallel requests to demonstrate the patterns
    const results = await Promise.all([
      api.get('/users/1'),
      api.get('/users/2'),
      api.get('/users/3'),
      api.post('/users', { name: 'New User' }),
      api.put('/users/1', { name: 'Updated User' }),
      api.delete('/users/2'),
    ]);

    console.log(`Successfully completed ${results.length} requests`);
  } catch (error) {
    console.error('Failed to complete all requests:', error);
  } finally {
    api.dispose();
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
} 