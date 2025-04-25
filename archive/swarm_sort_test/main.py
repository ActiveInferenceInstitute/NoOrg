import numpy as np
from swarm_sort import SwarmSort
import logging
import os
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='agents/swarm_sort_test/logs/main.log'
)
logger = logging.getLogger('Main')

def main():
    # Create necessary directories
    os.makedirs('agents/swarm_sort_test/logs', exist_ok=True)
    os.makedirs('agents/swarm_sort_test/results', exist_ok=True)
    
    # Generate random numbers
    np.random.seed(42)
    numbers = np.random.randint(1, 1000, size=100).tolist()
    
    # Initialize swarm sorter
    sorter = SwarmSort(num_agents=4)
    
    # Sort numbers
    logger.info("Starting swarm sort")
    sorted_numbers = sorter.sort(numbers)
    metrics = sorter.get_metrics()
    
    # Save results
    results = {
        'original_numbers': numbers,
        'sorted_numbers': sorted_numbers,
        'metrics': metrics
    }
    
    with open('agents/swarm_sort_test/results/sort_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Sorting completed. Results saved to sort_results.json")
    logger.info(f"Time taken: {metrics['time_taken']:.4f} seconds")
    logger.info(f"Number of operations: {metrics['num_operations']}")

if __name__ == '__main__':
    main() 