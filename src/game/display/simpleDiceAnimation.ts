import { Die } from '../core/types';
import { MATERIALS } from '../content/materials';

/**
 * Simple dice animation using normal terminal output
 * This won't interfere with the CLI interface
 */
export class SimpleDiceAnimation {
  private animationInterval?: NodeJS.Timeout;
  private isAnimating = false;
  private resolveAnimation?: () => void;

  // ASCII art dice faces - wider and more square-like
  private readonly diceFaces = [
    ['┌───────┐', '│       │', '│   ●   │', '│       │', '└───────┘'], // 1
    ['┌───────┐', '│ ●     │', '│       │', '│     ● │', '└───────┘'], // 2
    ['┌───────┐', '│ ●     │', '│   ●   │', '│     ● │', '└───────┘'], // 3
    ['┌───────┐', '│ ●   ● │', '│       │', '│ ●   ● │', '└───────┘'], // 4
    ['┌───────┐', '│ ●   ● │', '│   ●   │', '│ ●   ● │', '└───────┘'], // 5
    ['┌───────┐', '│ ●   ● │', '│ ●   ● │', '│ ●   ● │', '└───────┘']  // 6
  ];

  // ANSI color codes for terminal
  private readonly colors = {
    white: '\x1b[37m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    brightYellow: '\x1b[93m',
    brightRed: '\x1b[91m',
    brightMagenta: '\x1b[95m',
    orange: '\x1b[38;5;208m',
    brown: '\x1b[38;5;130m',
    purple: '\x1b[38;5;99m',
    gold: '\x1b[38;5;220m',
    orangeRed: '\x1b[38;2;255;69;0m',
    royalBlue: '\x1b[38;2;65;105;225m',
    limeGreen: '\x1b[38;2;50;205;50m',
    hotPink: '\x1b[38;2;255;105;180m',
    deepPurple: '\x1b[38;2;75;0;130m',
    reset: '\x1b[0m'
  };

  /**
   * Animate dice roll with actual game dice
   * dice should have the final rolled values already set
   * Returns a promise that resolves when animation completes
   */
  public async animateDiceRoll(dice: Die[], rollNumber?: number): Promise<void> {
    if (this.isAnimating) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.resolveAnimation = resolve;
      this.isAnimating = true;
      let frame = 0;
      const totalFrames = 15; // Half the time as requested

      // Clear previous animation lines and move cursor up
      this.clearAnimationLines();

      // Show Roll # once at the beginning
      if (rollNumber) {
        process.stdout.write(`Roll #${rollNumber}:\n`);
      }
      
      this.animationInterval = setInterval(() => {
        frame++;
        
        // Use random values during animation, but final frame uses actual values
        const isFinalFrame = frame >= totalFrames - 1;
        const animatedDice = dice.map(die => ({
          ...die,
          rolledValue: isFinalFrame ? die.rolledValue : Math.floor(Math.random() * die.sides) + 1 as any
        }));
        
        // Create animated display (without Roll #)
        let content = '';
        
        for (let row = 0; row < 5; row++) {
          animatedDice.forEach(die => {
            const dieRow = this.diceFaces[die.rolledValue! - 1][row];
            const material = MATERIALS.find(m => m.id === die.material);
            const color = this.getDieColorForRow(die, material, row);
            const colorCode = this.colors[color as keyof typeof this.colors] || this.colors.white;
            

            
            content += `${colorCode}${dieRow}${this.colors.reset} `;
          });
          content += '\n';
        }
        


        // Clear and redraw the dice area
        process.stdout.write('\x1b[5A'); // Move cursor up 5 lines
        process.stdout.write('\x1b[0J'); // Clear from cursor to end of screen
        process.stdout.write(content);

        // End animation
        if (frame >= totalFrames) {
          this.isAnimating = false;
          if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = undefined;
          }
          
          // Animation complete - add line break and resolve
          process.stdout.write('\n'); // Add line break after dice
          if (this.resolveAnimation) {
            this.resolveAnimation();
          }
        }
      }, 50); // Fast animation as requested
    });
  }

  private showFinalResult(dice: Die[], rollNumber?: number): void {
    setTimeout(() => {
      // Animation is complete, dice are already shown
    }, 100);
  }

  private clearAnimationLines(): void {
    // Clear just enough lines to make room for 5 dice rows
    process.stdout.write('\n\n\n\n\n');
  }

  private cleanup(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = undefined;
    }
  }

  /**
   * Get color for a specific row of a die (handles rainbow special case)
   */
  private getDieColorForRow(die: Die, material: any, row: number): string {
    if (material?.color === 'rainbow') {
      // Custom rainbow colors for rainbow die
      const rainbowColors = ['orangeRed', 'yellow', 'limeGreen', 'royalBlue', 'deepPurple', 'purple', 'hotPink'];
      return rainbowColors[row % rainbowColors.length];
    }
    
    // Map material colors to our color names
    switch (material?.color) {
      case 'purple':
        return 'purple';
      case 'gold':
        return 'gold';
      case 'orangeRed':
        return 'orangeRed';
      case 'royalBlue':
        return 'royalBlue';
      case 'yellow':
        return 'yellow';
      case 'white':
        return 'white';
      default:
        return 'white';
    }
  }

  /**
   * Get material color for a die
   */
  public static getDieColor(die: Die): string {
    const material = MATERIALS.find(m => m.id === die.material);
    if (material?.color === 'rainbow') {
      return 'red'; // Default to red for rainbow
    }
    return material?.color || 'white';
  }

  /**
   * Get material abbreviation for a die
   */
  public static getDieAbbreviation(die: Die): string {
    const material = MATERIALS.find(m => m.id === die.material);
    return material?.abbreviation || '--';
  }
} 