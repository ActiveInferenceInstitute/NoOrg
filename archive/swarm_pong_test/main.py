import argparse
from pong.trainer import SwarmTrainer

def main():
    parser = argparse.ArgumentParser(description='Swarm Pong Training and Gameplay')
    parser.add_argument('--train', action='store_true', help='Train the swarm')
    parser.add_argument('--play', action='store_true', help='Play using the best agent')
    parser.add_argument('--generations', type=int, default=50, help='Number of generations for training')
    parser.add_argument('--episodes', type=int, default=100, help='Episodes per generation')
    args = parser.parse_args()

    trainer = SwarmTrainer(
        episodes_per_generation=args.episodes,
        max_generations=args.generations
    )

    if args.train:
        print("Starting swarm training...")
        trainer.train(visualize=True)
        print("Training completed! Check training_progress.png for visualization.")

    if args.play:
        print("Playing game with best agent...")
        trainer.play_game(render=True)

if __name__ == "__main__":
    main() 