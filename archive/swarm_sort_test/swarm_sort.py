import numpy as np
import logging
from typing import List, Tuple
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='agents/swarm_sort_test/logs/swarm_sort.log'
)
logger = logging.getLogger('SwarmSort')

class SortingAgent:
    def __init__(self, id: int, segment_size: int):
        self.id = id
        self.segment_size = segment_size
        logger.info(f"Agent {self.id} initialized with segment size {segment_size}")
    
    def sort_segment(self, numbers: List[float], start: int) -> List[float]:
        """Sort a segment of the list using bubble sort"""
        end = min(start + self.segment_size, len(numbers))
        segment = numbers[start:end]
        sorted_segment = sorted(segment)
        logger.debug(f"Agent {self.id} sorted segment {start}:{end}")
        return sorted_segment

class SwarmSort:
    def __init__(self, num_agents: int = 4):
        self.num_agents = num_agents
        self.agents = []
        self.metrics = {
            'time_taken': 0,
            'num_operations': 0,
            'agent_utilization': []
        }
        logger.info(f"SwarmSort initialized with {num_agents} agents")
    
    def initialize_agents(self, list_size: int):
        segment_size = (list_size + self.num_agents - 1) // self.num_agents
        self.agents = [SortingAgent(i, segment_size) for i in range(self.num_agents)]
        logger.info(f"Initialized {self.num_agents} agents with segment size {segment_size}")
    
    def merge_segments(self, segments: List[List[float]]) -> List[float]:
        """Merge multiple sorted segments into a single sorted list"""
        result = []
        indices = [0] * len(segments)
        
        while True:
            min_val = float('inf')
            min_idx = -1
            
            for i, segment in enumerate(segments):
                if indices[i] < len(segment) and segment[indices[i]] < min_val:
                    min_val = segment[indices[i]]
                    min_idx = i
            
            if min_idx == -1:
                break
                
            result.append(min_val)
            indices[min_idx] += 1
            self.metrics['num_operations'] += 1
        
        return result
    
    def sort(self, numbers: List[float]) -> List[float]:
        """Sort the input list using a swarm of agents"""
        start_time = time.time()
        
        # Initialize agents
        self.initialize_agents(len(numbers))
        
        # Distribute work among agents
        sorted_segments = []
        for i in range(self.num_agents):
            start = i * self.agents[i].segment_size
            segment = self.agents[i].sort_segment(numbers, start)
            sorted_segments.append(segment)
            self.metrics['agent_utilization'].append(len(segment))
        
        # Merge sorted segments
        result = self.merge_segments(sorted_segments)
        
        self.metrics['time_taken'] = time.time() - start_time
        logger.info(f"Sorting completed in {self.metrics['time_taken']:.4f} seconds")
        
        return result
    
    def get_metrics(self) -> dict:
        """Return performance metrics"""
        return self.metrics 