import { SwarmTask } from '../types/swarm';

interface SortingState {
  index: number;
  chunk: number[];
  timestamp: number;
}

interface HanoiState {
  disk: number;
  from: string;
  to: string;
  state: {
    A: number[];
    B: number[];
    C: number[];
  };
  timestamp: number;
}

/**
 * Task Visualization State Collector
 * Singleton class to collect and manage visualization states for different task types
 */
export class TaskVisualizationCollector {
  private static instance: TaskVisualizationCollector;
  private states: Map<string, any[]>;

  private constructor() {
    this.states = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TaskVisualizationCollector {
    if (!TaskVisualizationCollector.instance) {
      TaskVisualizationCollector.instance = new TaskVisualizationCollector();
    }
    return TaskVisualizationCollector.instance;
  }

  /**
   * Record visualization state
   */
  recordState(taskType: string, state: any): void {
    if (!this.states.has(taskType)) {
      this.states.set(taskType, []);
    }
    this.states.get(taskType)?.push(state);
  }

  /**
   * Get states for task type
   */
  getStates(taskType: string): any[] {
    return this.states.get(taskType) || [];
  }

  /**
   * Clear all states
   */
  clearStates(): void {
    this.states.clear();
  }
}

/**
 * Towers of Hanoi Task Generator
 * Generates tasks for solving the Towers of Hanoi puzzle
 */
export class TowersOfHanoiTaskGenerator {
  private static readonly TASK_TYPE = 'hanoi_move';

  /**
   * Generate Hanoi move task
   */
  static generateMoveTask(
    disk: number,
    from: string,
    to: string,
    aux: string,
    state: { A: number[]; B: number[]; C: number[]; }
  ): SwarmTask {
    return {
      id: `hanoi-${disk}-${from}-${to}`,
      type: this.TASK_TYPE,
      priority: 'medium',
      status: 'pending',
      requiredCapabilities: [
        { type: 'compute', level: 2 }
      ],
      resourceRequirements: {
        cpu: 1,
        memory: 256,
        storage: 32
      },
      divisible: false,
      size: 1,
      context: {
        disk,
        from,
        to,
        aux,
        state
      }
    };
  }

  /**
   * Generate solution tasks
   */
  static generateSolutionTasks(numDisks: number): SwarmTask[] {
    const tasks: SwarmTask[] = [];
    const state = {
      A: Array.from({ length: numDisks }, (_, i) => numDisks - i),
      B: [],
      C: []
    };

    this.generateMoves(numDisks, 'A', 'C', 'B', state, tasks);
    return tasks;
  }

  /**
   * Generate move sequence recursively
   */
  private static generateMoves(
    n: number,
    from: string,
    to: string,
    aux: string,
    state: { A: number[]; B: number[]; C: number[]; },
    tasks: SwarmTask[]
  ): void {
    if (n === 1) {
      tasks.push(this.generateMoveTask(1, from, to, aux, { ...state }));
      this.moveDisk(state, from, to);
      return;
    }

    this.generateMoves(n - 1, from, aux, to, state, tasks);
    tasks.push(this.generateMoveTask(n, from, to, aux, { ...state }));
    this.moveDisk(state, from, to);
    this.generateMoves(n - 1, aux, to, from, state, tasks);
  }

  /**
   * Move disk in state
   */
  private static moveDisk(
    state: { A: number[]; B: number[]; C: number[]; },
    from: string,
    to: string
  ): void {
    const disk = state[from as keyof typeof state].pop();
    if (disk) {
      state[to as keyof typeof state].push(disk);
    }
  }
}

/**
 * Sorting Task Generator
 * Generates tasks for parallel sorting implementation
 */
export class SortingTaskGenerator {
  private static readonly TASK_TYPE = 'sort_chunk';

  /**
   * Generate sorting task for chunk
   */
  static generateChunkTask(
    index: number,
    chunk: number[],
    start: number,
    end: number
  ): SwarmTask {
    return {
      id: `sort-${index}`,
      type: this.TASK_TYPE,
      priority: 'medium',
      status: 'pending',
      requiredCapabilities: [
        { type: 'compute', level: 2 },
        { type: 'sorting', level: 2 }
      ],
      resourceRequirements: {
        cpu: 1,
        memory: 512,
        storage: 64
      },
      divisible: false,
      size: chunk.length,
      context: {
        index,
        chunk,
        start,
        end
      }
    };
  }

  /**
   * Generate merge task for two chunks
   */
  static generateMergeTask(
    index: number,
    left: number[],
    right: number[],
    start: number,
    end: number
  ): SwarmTask {
    return {
      id: `merge-${index}`,
      type: 'merge_chunks',
      priority: 'medium',
      status: 'pending',
      requiredCapabilities: [
        { type: 'compute', level: 2 }
      ],
      resourceRequirements: {
        cpu: 1,
        memory: 512,
        storage: 64
      },
      divisible: false,
      size: left.length + right.length,
      context: {
        index,
        left,
        right,
        start,
        end
      }
    };
  }

  /**
   * Generate parallel sorting tasks
   */
  static generateSortingTasks(array: number[], numChunks: number): SwarmTask[] {
    const tasks: SwarmTask[] = [];
    const chunkSize = Math.ceil(array.length / numChunks);

    // Generate chunk sorting tasks
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, array.length);
      const chunk = array.slice(start, end);

      tasks.push(this.generateChunkTask(i, chunk, start, end));
    }

    // Generate merge tasks
    let level = 0;
    let levelTasks = numChunks;
    while (levelTasks > 1) {
      const nextLevelTasks = Math.ceil(levelTasks / 2);
      for (let i = 0; i < nextLevelTasks; i++) {
        const leftIndex = i * 2;
        const rightIndex = leftIndex + 1;

        if (rightIndex < levelTasks) {
          const start = leftIndex * chunkSize;
          const end = Math.min((rightIndex + 1) * chunkSize, array.length);
          tasks.push(this.generateMergeTask(
            level * numChunks + i,
            [], // Left chunk will be filled during execution
            [], // Right chunk will be filled during execution
            start,
            end
          ));
        }
      }
      level++;
      levelTasks = nextLevelTasks;
    }

    return tasks;
  }
} 