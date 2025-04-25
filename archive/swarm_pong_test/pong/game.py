import pygame
import numpy as np
from dataclasses import dataclass
from typing import Tuple, Optional

@dataclass
class GameState:
    paddle1_pos: float  # y position
    paddle2_pos: float
    ball_pos: Tuple[float, float]  # (x, y)
    ball_vel: Tuple[float, float]  # (vx, vy)
    score1: int
    score2: int

class PongGame:
    """Pong game environment with physics simulation."""
    
    VALID_ACTIONS = {0, 1, 2}  # stay, up, down
    
    def __init__(self, width: int = 800, height: int = 600, headless: bool = False, fps: int = 60):
        """
        Initialize the Pong game.
        
        Args:
            width: Game window width
            height: Game window height
            headless: If True, run without visualization
            fps: Frames per second for visualization
        """
        self.width = width
        self.height = height
        self.paddle_width = 15
        self.paddle_height = 90
        self.ball_size = 15
        self.paddle_speed = 5
        self.ball_speed = 7
        self.fps = fps
        self.headless = headless
        
        # Initialize pygame
        if not headless:
            pygame.init()
            self.screen = pygame.display.set_mode((width, height))
            pygame.display.set_caption("Swarm Pong")
            self.clock = pygame.time.Clock()
        
        # Initialize state
        self.state = GameState(
            paddle1_pos=self.height/2,
            paddle2_pos=self.height/2,
            ball_pos=(self.width/2, self.height/2),
            ball_vel=(self.ball_speed * (1 if np.random.random() > 0.5 else -1), 
                     self.ball_speed * (np.random.random() - 0.5)),
            score1=0,
            score2=0
        )
    
    def reset_game(self) -> GameState:
        """Reset the game to initial state."""
        # Keep the current scores
        current_score1 = self.state.score1
        current_score2 = self.state.score2
        
        self.state = GameState(
            paddle1_pos=self.height/2,
            paddle2_pos=self.height/2,
            ball_pos=(self.width/2, self.height/2),
            ball_vel=(self.ball_speed * (1 if np.random.random() > 0.5 else -1), 
                     self.ball_speed * (np.random.random() - 0.5)),
            score1=current_score1,
            score2=current_score2
        )
        return self.state

    def step(self, action1: int, action2: int) -> Tuple[GameState, bool, dict]:
        """
        Execute one game step.
        
        Args:
            action1: Action for paddle 1 (0=stay, 1=up, 2=down)
            action2: Action for paddle 2 (0=stay, 1=up, 2=down)
            
        Returns:
            Tuple of (new_state, done, info)
        
        Raises:
            ValueError: If actions are invalid
        """
        # Validate actions
        if action1 not in self.VALID_ACTIONS or action2 not in self.VALID_ACTIONS:
            raise ValueError(f"Invalid action. Actions must be in {self.VALID_ACTIONS}")
        
        # Check if ball is already at scoring position
        if self.state.ball_pos[0] <= 0:
            self.state.score2 += 1
            state = self.reset_game()
            return state, True, {"score1": state.score1, "score2": state.score2}
        elif self.state.ball_pos[0] >= self.width:
            self.state.score1 += 1
            state = self.reset_game()
            return state, True, {"score1": state.score1, "score2": state.score2}

        # Move paddles
        if action1 == 1:
            self.state.paddle1_pos = max(self.paddle_height/2,
                                       self.state.paddle1_pos - self.paddle_speed)
        elif action1 == 2:
            self.state.paddle1_pos = min(self.height - self.paddle_height/2,
                                       self.state.paddle1_pos + self.paddle_speed)
            
        if action2 == 1:
            self.state.paddle2_pos = max(self.paddle_height/2,
                                       self.state.paddle2_pos - self.paddle_speed)
        elif action2 == 2:
            self.state.paddle2_pos = min(self.height - self.paddle_height/2,
                                       self.state.paddle2_pos + self.paddle_speed)

        # Move ball
        new_x = self.state.ball_pos[0] + self.state.ball_vel[0]
        new_y = self.state.ball_pos[1] + self.state.ball_vel[1]

        # Ball collision with top/bottom
        if new_y <= 0 or new_y >= self.height:
            self.state.ball_vel = (self.state.ball_vel[0], -self.state.ball_vel[1])
            new_y = self.state.ball_pos[1] + self.state.ball_vel[1]

        # Ball collision with paddles
        if (new_x <= self.paddle_width and 
            abs(new_y - self.state.paddle1_pos) < self.paddle_height/2):
            self.state.ball_vel = (abs(self.state.ball_vel[0]), self.state.ball_vel[1])
            new_x = self.state.ball_pos[0] + self.state.ball_vel[0]
        elif (new_x >= self.width - self.paddle_width and 
              abs(new_y - self.state.paddle2_pos) < self.paddle_height/2):
            self.state.ball_vel = (-abs(self.state.ball_vel[0]), self.state.ball_vel[1])
            new_x = self.state.ball_pos[0] + self.state.ball_vel[0]

        # Update ball position
        self.state.ball_pos = (new_x, new_y)

        # Check scoring after movement
        if new_x <= 0:
            self.state.score2 += 1
            state = self.reset_game()
            return state, True, {"score1": state.score1, "score2": state.score2}
        elif new_x >= self.width:
            self.state.score1 += 1
            state = self.reset_game()
            return state, True, {"score1": state.score1, "score2": state.score2}

        return self.state, False, {"score1": self.state.score1, "score2": self.state.score2}

    def render(self) -> None:
        """
        Render the current game state.
        
        Raises:
            RuntimeError: If game is in headless mode
        """
        if self.headless:
            raise RuntimeError("Cannot render in headless mode")
            
        self.screen.fill((0, 0, 0))
        
        # Draw paddles
        pygame.draw.rect(self.screen, (255, 255, 255),
                        (0, self.state.paddle1_pos - self.paddle_height/2,
                         self.paddle_width, self.paddle_height))
        pygame.draw.rect(self.screen, (255, 255, 255),
                        (self.width - self.paddle_width,
                         self.state.paddle2_pos - self.paddle_height/2,
                         self.paddle_width, self.paddle_height))
        
        # Draw ball
        pygame.draw.circle(self.screen, (255, 255, 255),
                         (int(self.state.ball_pos[0]), int(self.state.ball_pos[1])),
                         self.ball_size//2)
        
        # Draw scores
        font = pygame.font.Font(None, 74)
        score1_surf = font.render(str(self.state.score1), True, (255, 255, 255))
        score2_surf = font.render(str(self.state.score2), True, (255, 255, 255))
        self.screen.blit(score1_surf, (self.width/4, 20))
        self.screen.blit(score2_surf, (3*self.width/4, 20))
        
        pygame.display.flip()
        self.clock.tick(self.fps)

    def close(self) -> None:
        """Clean up resources."""
        if not self.headless:
            pygame.quit() 