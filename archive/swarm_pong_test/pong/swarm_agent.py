import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import os
from typing import List, Tuple, Optional
from dataclasses import dataclass
from .game import GameState

@dataclass
class SwarmMember:
    """Individual agent in the swarm."""
    network: nn.Module
    fitness: float = 0.0
    games_played: int = 0

class PongNetwork(nn.Module):
    """Neural network for Pong decision making."""
    def __init__(self, input_size: int = 6, hidden_size: int = 32):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, 3)  # 3 actions: stay, up, down
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return F.softmax(self.fc3(x), dim=-1)

class SwarmAgent:
    """Swarm intelligence system for Pong."""
    def __init__(self, swarm_size: int = 50, exploration_noise: float = 0.1):
        """
        Initialize the swarm agent.
        
        Args:
            swarm_size: Number of agents in the swarm
            exploration_noise: Probability of taking a random action during training
        """
        self.swarm_size = swarm_size
        self.exploration_noise = exploration_noise
        self.swarm: List[SwarmMember] = []
        self.best_fitness = float('-inf')
        self.best_network = None
        
        # Initialize swarm
        for _ in range(swarm_size):
            network = PongNetwork()
            self.swarm.append(SwarmMember(network=network))
    
    def _state_to_tensor(self, state: GameState, is_left_paddle: bool) -> torch.Tensor:
        """Convert game state to network input tensor."""
        if is_left_paddle:
            return torch.tensor([
                state.paddle1_pos / 600,  # normalize positions
                state.ball_pos[1] / 600,
                state.ball_pos[0] / 800,
                state.ball_vel[0] / 10,  # normalize velocities
                state.ball_vel[1] / 10,
                (state.paddle2_pos - state.ball_pos[1]) / 600  # opponent relative position
            ], dtype=torch.float32)
        else:
            return torch.tensor([
                state.paddle2_pos / 600,
                state.ball_pos[1] / 600,
                (800 - state.ball_pos[0]) / 800,
                -state.ball_vel[0] / 10,
                state.ball_vel[1] / 10,
                (state.paddle1_pos - state.ball_pos[1]) / 600
            ], dtype=torch.float32)
    
    def get_action(self, state: GameState, member_idx: int, is_left_paddle: bool, training: bool = True) -> int:
        """
        Get action from specific swarm member.
        
        Args:
            state: Current game state
            member_idx: Index of the swarm member
            is_left_paddle: Whether this agent controls the left paddle
            training: Whether we're in training mode (enables exploration)
            
        Returns:
            Action index (0=stay, 1=up, 2=down)
        """
        # Exploration during training
        if training and np.random.random() < self.exploration_noise:
            return np.random.randint(3)
            
        with torch.no_grad():
            state_tensor = self._state_to_tensor(state, is_left_paddle)
            action_probs = self.swarm[member_idx].network(state_tensor)
            return torch.argmax(action_probs).item()
    
    def update_fitness(self, member_idx: int, reward: float) -> None:
        """Update fitness of a swarm member."""
        member = self.swarm[member_idx]
        member.fitness = (member.fitness * member.games_played + reward) / (member.games_played + 1)
        member.games_played += 1
        
        if member.fitness > self.best_fitness:
            self.best_fitness = member.fitness
            self.best_network = member.network
    
    def _crossover(self, parent1: PongNetwork, parent2: PongNetwork) -> PongNetwork:
        """
        Perform crossover between two parent networks.
        
        Args:
            parent1: First parent network
            parent2: Second parent network
            
        Returns:
            Child network with mixed parameters from both parents
        """
        child = PongNetwork()
        child_state = child.state_dict()
        p1_state = parent1.state_dict()
        p2_state = parent2.state_dict()
        
        # Randomly choose parameters from either parent
        for key in child_state:
            if np.random.random() > 0.5:
                child_state[key] = p1_state[key]
            else:
                child_state[key] = p2_state[key]
        
        child.load_state_dict(child_state)
        return child
    
    def evolve(self, mutation_rate: float = 0.1, elite_size: int = 5) -> None:
        """
        Evolve the swarm based on fitness.
        
        Args:
            mutation_rate: Probability of mutating each parameter
            elite_size: Number of best members to keep unchanged
        """
        # Sort swarm by fitness
        self.swarm.sort(key=lambda x: x.fitness, reverse=True)
        
        # Keep elite members
        new_swarm = self.swarm[:elite_size]
        
        # Generate new members through crossover and mutation
        while len(new_swarm) < self.swarm_size:
            # Select parents (tournament selection)
            tournament_size = 5
            parent1_idx = max(np.random.choice(len(self.swarm), tournament_size), 
                            key=lambda i: self.swarm[i].fitness)
            parent2_idx = max(np.random.choice(len(self.swarm), tournament_size), 
                            key=lambda i: self.swarm[i].fitness)
            
            parent1 = self.swarm[parent1_idx].network
            parent2 = self.swarm[parent2_idx].network
            
            # Create child through crossover
            child = self._crossover(parent1, parent2)
            
            # Apply mutations
            with torch.no_grad():
                for param in child.parameters():
                    if np.random.random() < mutation_rate:
                        param.add_(torch.randn_like(param) * 0.1)
            
            new_swarm.append(SwarmMember(network=child))
        
        self.swarm = new_swarm
    
    def get_best_action(self, state: GameState, is_left_paddle: bool) -> int:
        """Get action from the best performing network."""
        if self.best_network is None:
            return np.random.randint(3)
        
        with torch.no_grad():
            state_tensor = self._state_to_tensor(state, is_left_paddle)
            action_probs = self.best_network(state_tensor)
            return torch.argmax(action_probs).item()
    
    def save_model(self, path: str) -> None:
        """
        Save the best network to a file.
        
        Args:
            path: Path to save the model
        """
        if self.best_network is not None:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            torch.save(self.best_network.state_dict(), path)
    
    def load_model(self, path: str) -> None:
        """
        Load a network from a file.
        
        Args:
            path: Path to the saved model
        """
        if os.path.exists(path):
            self.best_network = PongNetwork()
            self.best_network.load_state_dict(torch.load(path))
            self.best_network.eval() 