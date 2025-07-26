import * as blessed from 'blessed';
import { Die } from '../core/types';
import { MATERIALS } from '../content/materials';

/**
 * Game-integrated dice animation system
 * Automatically triggered on roll/reroll with material-based colors
 */
export class GameDiceAnimation {
  private screen: any;
  private diceBox: any;
  private animationInterval?: NodeJS.Timeout;
  private isAnimating = false;
  private resolveAnimation?: () => void;

  // ASCII art dice faces
  private readonly diceFaces = [
    ['┌─────┐', '│     │', '│  ●  │', '│     │', '└─────┘'], // 1
    ['┌─────┐', '│ ●   │', '│     │', '│   ● │', '└─────┘'], // 2
    ['┌─────┐', '│ ●   │', '│  ●  │', '│   ● │', '└─────┘'], // 3
    ['┌─────┐', '│ ● ● │', '│     │', '│ ● ● │', '└─────┘'], // 4
    ['┌─────┐', '│ ● ● │', '│  ●  │', '│ ● ● │', '└─────┘'], // 5
    ['┌─────┐', '│ ● ● │', '│ ● ● │', '│ ● ● │', '└─────┘']  // 6
  ];

  constructor() {
    // Don't initialize blessed by default - only when needed
  }

  private initializeBlessed(): void {
    if (this.screen) return; // Already initialized
    
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Rollio Dice Animation',
      fullUnicode: true,
      autoPadding: true
    });

    this.diceBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 80,
      height: 20,
      tags: true,
      border: { type: 'line' },
      style: {
        fg: 'white',
        border: { fg: 'blue' }
      }
    });
  }

  /**
   * Animate dice roll with actual game dice
   * Returns a promise that resolves when animation completes
   */
  public async animateDiceRoll(dice: Die[]): Promise<void> {
    // Only initialize blessed if we're in a terminal environment and haven't already
    if (typeof process !== 'undefined' && process.stdout && process.stdout.isTTY) {
      this.initializeBlessed();
    } else {
      return Promise.resolve();
    }

    if (!this.screen) {
      return Promise.resolve();
    }

    if (this.isAnimating) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.resolveAnimation = resolve;
      this.isAnimating = true;
      let frame = 0;
      const totalFrames = 15; // Half the time as requested

      this.animationInterval = setInterval(() => {
        frame++;
        
        // Randomize dice values for animation
        const animatedDice = dice.map(die => ({
          ...die,
          rolledValue: Math.floor(Math.random() * 6) + 1 as any
        }));

        // Create animated display
        let content = '{center}🎲 Rolling Dice... 🎲{/center}\n\n';
        
        for (let row = 0; row < 5; row++) {
          let rowContent = '{center}';
          
          animatedDice.forEach(die => {
            const dieRow = this.diceFaces[die.rolledValue! - 1][row];
            const material = MATERIALS.find(m => m.id === die.material);
            const color = this.getDieColorForRow(die, material, row);
            const colorTag = `{${color}-fg}`;
            
            rowContent += `${colorTag}${dieRow}{/} `;
          });
          
          rowContent += '{/center}\n';
          content += rowContent;
        }
        
        content += `\n{center}Frame: ${frame}/${totalFrames}{/center}`;

        this.diceBox.setContent(content);
        this.screen.render();

        // End animation
        if (frame >= totalFrames) {
          this.isAnimating = false;
          if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = undefined;
          }
          
          // Show final result briefly
          setTimeout(() => {
            this.showFinalResult(dice);
            setTimeout(() => {
              this.cleanup(); // Clean up blessed screen
              if (this.resolveAnimation) {
                this.resolveAnimation();
              }
            }, 1000);
          }, 200);
        }
      }, 50); // Fast animation as requested
    });
  }

  private showFinalResult(dice: Die[]): void {
    let content = '{center}🎯 Roll Complete! 🎯{/center}\n\n';
    
    // Display each row of the dice with final values
    for (let row = 0; row < 5; row++) {
      let rowContent = '{center}';
      
      dice.forEach(die => {
        const dieRow = this.diceFaces[die.rolledValue! - 1][row];
        const material = MATERIALS.find(m => m.id === die.material);
        const color = this.getDieColorForRow(die, material, row);
        const colorTag = `{${color}-fg}`;
        
        rowContent += `${colorTag}${dieRow}{/} `;
      });
      
      rowContent += '{/center}\n';
      content += rowContent;
    }
    
    // Show dice info
    content += '\n{center}Values: ' + dice.map(d => d.rolledValue).join(', ') + '{/center}\n';
    content += '{center}Materials: ' + dice.map(d => MATERIALS.find(m => m.id === d.material)?.abbreviation).join(', ') + '{/center}';

    this.diceBox.setContent(content);
    this.screen.render();
  }

  private cleanup(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = undefined;
    }
    if (this.screen) {
      this.screen.destroy();
      this.screen = null;
      this.diceBox = null;
    }
  }

  /**
   * Get color for a specific row of a die (handles rainbow special case)
   */
  private getDieColorForRow(die: Die, material: any, row: number): string {
    if (material?.color === 'rainbow') {
      // ROYGBIV colors for rainbow die
      const rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta'];
      return rainbowColors[row % rainbowColors.length];
    }
    
    // Special case for wooden - use a brownish color
    if (material?.id === 'wooden') {
      return 'yellow'; // Blessed doesn't have brown, so we'll use yellow as closest
    }
    
    // Special case for golden - use a more golden color
    if (material?.id === 'golden') {
      return 'yellow'; // Blessed doesn't have gold, so we'll use yellow
    }
    
    return material?.color || 'white';
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