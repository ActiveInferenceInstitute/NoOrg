import numpy as np
import os
from typing import Tuple, List, Optional, Dict
import matplotlib.pyplot as plt
from .game import PongGame
from .swarm_agent import SwarmAgent

class SwarmTrainer:
    """Training system for swarm-based Pong agents."""
    def __init__(self, 
                 episodes_per_generation: int = 100,
                 max_generations: int = 50,
                 checkpoint_dir: str = "checkpoints",
                 patience: int = 10,
                 min_improvement: float = 0.001):
        """
        Initialize the trainer.
        
        Args:
            episodes_per_generation: Number of episodes to play per generation
            max_generations: Maximum number of generations to train
            checkpoint_dir: Directory to save model checkpoints
            patience: Number of generations to wait for improvement before early stopping
            min_improvement: Minimum improvement in fitness to reset patience
        """
        self.episodes_per_generation = episodes_per_generation
        self.max_generations = max_generations
        self.checkpoint_dir = checkpoint_dir
        self.patience = patience
        self.min_improvement = min_improvement
        
        self.game = PongGame(headless=True)  # Use headless mode for training
        self.swarm = SwarmAgent()
        self.fitness_history: List[float] = []
        self.training_metrics: Dict[str, List[float]] = {
            'avg_reward': [],
            'best_fitness': [],
            'exploration_rate': []
        }
        
        # Create checkpoint directory
        os.makedirs(checkpoint_dir, exist_ok=True)
    
    def train_generation(self) -> Tuple[float, float]:
        """Train one generation of the swarm."""
        total_reward = 0
        games_played = 0
        
        # Each member plays against every other member
        for i in range(self.swarm.swarm_size):
            for j in range(i + 1, self.swarm.swarm_size):
                state = self.game.reset_game()
                done = False
                episode_reward = 0
                
                while not done:
                    # Get actions from both agents
                    action1 = self.swarm.get_action(state, i, True, training=True)
                    action2 = self.swarm.get_action(state, j, False, training=True)
                    
                    # Step the environment
                    state, done, info = self.game.step(action1, action2)
                    
                    # Calculate rewards
                    if done:
                        if info['score1'] > info['score2']:
                            reward1, reward2 = 1.0, -1.0
                        elif info['score2'] > info['score1']:
                            reward1, reward2 = -1.0, 1.0
                        else:
                            reward1, reward2 = 0.0, 0.0
                        
                        # Update fitness
                        self.swarm.update_fitness(i, reward1)
                        self.swarm.update_fitness(j, reward2)
                        
                        episode_reward = max(reward1, reward2)
                        total_reward += episode_reward
                        games_played += 1
        
        avg_reward = total_reward / games_played if games_played > 0 else 0
        self.fitness_history.append(self.swarm.best_fitness)
        
        # Update training metrics
        self.training_metrics['avg_reward'].append(avg_reward)
        self.training_metrics['best_fitness'].append(self.swarm.best_fitness)
        self.training_metrics['exploration_rate'].append(self.swarm.exploration_noise)
        
        return avg_reward, self.swarm.best_fitness
    
    def save_checkpoint(self, generation: int) -> None:
        """Save a training checkpoint."""
        checkpoint_path = os.path.join(self.checkpoint_dir, f"model_gen_{generation}.pt")
        self.swarm.save_model(checkpoint_path)
    
    def train(self, visualize: bool = True) -> None:
        """Train the swarm for multiple generations."""
        best_fitness = float('-inf')
        patience_counter = 0
        
        for generation in range(self.max_generations):
            avg_reward, current_fitness = self.train_generation()
            
            # Check for improvement
            if current_fitness > best_fitness + self.min_improvement:
                best_fitness = current_fitness
                patience_counter = 0
                # Save checkpoint on improvement
                self.save_checkpoint(generation)
            else:
                patience_counter += 1
            
            # Print progress
            print(f"Generation {generation + 1}/{self.max_generations}")
            print(f"Average Reward: {avg_reward:.3f}")
            print(f"Best Fitness: {current_fitness:.3f}")
            print(f"Patience Counter: {patience_counter}/{self.patience}")
            print("-" * 40)
            
            # Early stopping
            if patience_counter >= self.patience:
                print("Early stopping: No improvement for", self.patience, "generations")
                break
            
            # Evolve the population
            self.swarm.evolve()
            
            # Decay exploration rate
            self.swarm.exploration_noise *= 0.995  # Gradual decay
            
        if visualize:
            self.visualize_training()
    
    def visualize_training(self) -> None:
        """Visualize the training progress with detailed metrics."""
        plt.figure(figsize=(15, 5))
        
        # Plot 1: Fitness History
        plt.subplot(1, 3, 1)
        plt.plot(self.training_metrics['best_fitness'], label='Best Fitness')
        plt.xlabel('Generation')
        plt.ylabel('Fitness')
        plt.title('Best Fitness Over Time')
        plt.legend()
        plt.grid(True)
        
        # Plot 2: Average Reward
        plt.subplot(1, 3, 2)
        plt.plot(self.training_metrics['avg_reward'], label='Average Reward', color='orange')
        plt.xlabel('Generation')
        plt.ylabel('Average Reward')
        plt.title('Average Reward Per Generation')
        plt.legend()
        plt.grid(True)
        
        # Plot 3: Exploration Rate
        plt.subplot(1, 3, 3)
        plt.plot(self.training_metrics['exploration_rate'], label='Exploration Rate', color='green')
        plt.xlabel('Generation')
        plt.ylabel('Exploration Rate')
        plt.title('Exploration Rate Decay')
        plt.legend()
        plt.grid(True)
        
        plt.tight_layout()
        plt.savefig('training_progress.png')
        plt.close()
    
    def play_game(self, render: bool = True, model_path: Optional[str] = None) -> None:
        """
        Play a game using the best agent.
        
        Args:
            render: Whether to render the game
            model_path: Optional path to a saved model to load
        """
        if model_path:
            self.swarm.load_model(model_path)
            
        game = PongGame(headless=not render)  # New game instance for playing
        state = game.reset_game()
        done = False
        
        while not done:
            if render:
                game.render()
            
            # Get actions
            action1 = self.swarm.get_best_action(state, True)
            action2 = np.random.randint(3)  # Random opponent
            
            state, done, _ = game.step(action1, action2)
        
        game.close() 