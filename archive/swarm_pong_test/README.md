# Swarm Pong

A Pong game implementation using swarm intelligence, where a collection of agents learns to play the game through evolutionary algorithms and collective behavior.

## Features

- Classic Pong gameplay mechanics
- Swarm-based learning system
- Neural network-powered agents
- Evolutionary algorithm for agent improvement
- Training visualization
- Interactive gameplay against trained agents

## Requirements

All dependencies are listed in `requirements.txt`. Install them using:

```bash
pip install -r requirements.txt
```

## Project Structure

```
.
├── pong/
│   ├── game.py         # Core Pong game implementation
│   ├── swarm_agent.py  # Swarm intelligence system
│   └── trainer.py      # Training infrastructure
├── tests/
│   └── test_pong.py    # Test suite
├── main.py             # Main script for running the game
└── requirements.txt    # Project dependencies
```

## Usage

### Training the Swarm

To train the swarm of agents:

```bash
python main.py --train --generations 50 --episodes 100
```

This will:
1. Train the swarm for the specified number of generations
2. Save a visualization of the training progress
3. Save the best performing agent

### Playing Against the Trained Agent

To play a game against the best trained agent:

```bash
python main.py --play
```

### Running Tests

To run the test suite:

```bash
pytest tests/
```

## How It Works

### Game Mechanics
- Classic Pong implementation using Pygame
- Two paddles and a ball
- Score tracking and collision detection

### Swarm Intelligence
- Population of neural network agents
- Each agent learns from playing against others
- Evolutionary selection based on performance
- Mutation and crossover for population diversity

### Training Process
1. Agents play against each other
2. Performance metrics are recorded
3. Best performing agents are selected
4. New population is generated through evolution
5. Process repeats for specified generations

## Visualization

Training progress is visualized and saved as `training_progress.png`, showing:
- Best fitness over generations
- Population diversity
- Learning curve

## Contributing

Feel free to contribute to this project by:
1. Opening issues for bugs or feature requests
2. Submitting pull requests with improvements
3. Adding more sophisticated training methods
4. Enhancing the visualization system 