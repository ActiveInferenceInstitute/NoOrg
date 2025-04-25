import pytest
import numpy as np
import torch
from pong.game import PongGame, GameState
from pong.swarm_agent import SwarmAgent, PongNetwork
from pong.trainer import SwarmTrainer

def test_game_initialization():
    """Test game initialization."""
    game = PongGame()
    state = game.reset_game()
    
    assert isinstance(state, GameState)
    assert 0 <= state.paddle1_pos <= 600
    assert 0 <= state.paddle2_pos <= 600
    assert 0 <= state.ball_pos[0] <= 800
    assert 0 <= state.ball_pos[1] <= 600
    assert state.score1 == 0
    assert state.score2 == 0

def test_game_step():
    """Test game step mechanics."""
    game = PongGame()
    state = game.reset_game()
    
    # Test paddle movement
    initial_paddle1_pos = state.paddle1_pos
    state, _, _ = game.step(1, 0)  # Move paddle1 up
    assert state.paddle1_pos < initial_paddle1_pos
    
    initial_paddle1_pos = state.paddle1_pos
    state, _, _ = game.step(2, 0)  # Move paddle1 down
    assert state.paddle1_pos > initial_paddle1_pos

def test_ball_collision():
    """Test ball collision mechanics."""
    game = PongGame()
    state = game.reset_game()
    
    # Force ball position near paddle
    game.state.ball_pos = (game.paddle_width + 1, game.state.paddle1_pos)
    game.state.ball_vel = (-5, 0)
    
    # Ball should bounce off paddle
    state, _, _ = game.step(0, 0)
    assert game.state.ball_vel[0] > 0

def test_scoring():
    """Test scoring mechanics."""
    game = PongGame()
    
    # Test left side scoring
    game.reset_game()
    initial_score2 = game.state.score2
    game.state.ball_pos = (0, 300)  # At the left edge
    game.state.ball_vel = (-10, 0)
    
    state, done, info = game.step(0, 0)
    assert done
    assert info['score2'] == initial_score2 + 1
    
    # Test right side scoring
    game.reset_game()
    initial_score1 = game.state.score1
    game.state.ball_pos = (game.width, 300)  # At the right edge
    game.state.ball_vel = (10, 0)
    
    state, done, info = game.step(0, 0)
    assert done
    assert info['score1'] == initial_score1 + 1

def test_swarm_agent_initialization():
    """Test swarm agent initialization."""
    swarm = SwarmAgent(swarm_size=10)
    assert len(swarm.swarm) == 10
    assert swarm.best_network is None
    assert swarm.best_fitness == float('-inf')

def test_network_forward():
    """Test neural network forward pass."""
    network = PongNetwork()
    state = GameState(
        paddle1_pos=300,
        paddle2_pos=300,
        ball_pos=(400, 300),
        ball_vel=(5, 0),
        score1=0,
        score2=0
    )
    
    swarm = SwarmAgent()
    state_tensor = swarm._state_to_tensor(state, True)
    
    with torch.no_grad():
        output = network(state_tensor)
        assert output.shape == (3,)
        assert torch.allclose(output.sum(), torch.tensor(1.0))

def test_swarm_evolution():
    """Test swarm evolution mechanics."""
    swarm = SwarmAgent(swarm_size=10)
    
    # Update fitness of some members
    swarm.update_fitness(0, 1.0)
    swarm.update_fitness(1, 0.5)
    
    initial_best = swarm.best_fitness
    swarm.evolve()
    
    assert len(swarm.swarm) == 10
    assert swarm.best_fitness == initial_best

def test_trainer_initialization():
    """Test trainer initialization."""
    trainer = SwarmTrainer(episodes_per_generation=10, max_generations=5)
    assert trainer.episodes_per_generation == 10
    assert trainer.max_generations == 5
    assert len(trainer.fitness_history) == 0

def test_training_generation():
    """Test training for one generation."""
    trainer = SwarmTrainer(episodes_per_generation=2, max_generations=1)
    avg_reward, best_fitness = trainer.train_generation()
    
    assert isinstance(avg_reward, float)
    assert isinstance(best_fitness, float)
    assert len(trainer.fitness_history) == 1 