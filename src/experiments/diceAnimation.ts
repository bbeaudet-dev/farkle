import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';

/**
 * Experimental dice rolling animation using Blessed
 * This demonstrates how we could enhance the CLI with animated dice rolls
 */
export class DiceAnimation {
  private screen: any;
  private diceBox: any;
  private animationInterval?: NodeJS.Timeout;
  private isAnimating = false;

  constructor() {
    // Create blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Rollio Dice Animation'
    });

    // Create dice display box - much bigger!
    this.diceBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: 80,
      height: 20,
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'blue'
        }
      }
    });

    // Handle exit
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.cleanup();
      process.exit(0);
    });

    // Handle space to trigger animation
    this.screen.key(['space'], () => {
      if (!this.isAnimating) {
        this.animateDiceRoll();
      }
    });

    this.showInstructions();
  }

  private showInstructions(): void {
    this.diceBox.setContent(
      '{center}🎲 Rollio Dice Animation 🎲{/center}\n\n' +
      'Press {bold}SPACE{/bold} to roll dice\n' +
      'Press {bold}Q{/bold} or {bold}ESC{/bold} to exit\n\n' +
      'Ready to roll!'
    );
    this.screen.render();
  }

  private animateDiceRoll(): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    let frame = 0;
    const totalFrames = 30; // More frames for smoother animation
    
    // Big ASCII art dice faces
    const diceFaces = [
      // Die 1
      ['┌─────┐', '│     │', '│  ●  │', '│     │', '└─────┘'],
      // Die 2  
      ['┌─────┐', '│ ●   │', '│     │', '│   ● │', '└─────┘'],
      // Die 3
      ['┌─────┐', '│ ●   │', '│  ●  │', '│   ● │', '└─────┘'],
      // Die 4
      ['┌─────┐', '│ ● ● │', '│     │', '│ ● ● │', '└─────┘'],
      // Die 5
      ['┌─────┐', '│ ● ● │', '│  ●  │', '│ ● ● │', '└─────┘'],
      // Die 6
      ['┌─────┐', '│ ● ● │', '│ ● ● │', '│ ● ● │', '└─────┘']
    ];

    this.animationInterval = setInterval(() => {
      frame++;
      
      // Generate random dice values for animation
      const dice1Index = Math.floor(Math.random() * 6);
      const dice2Index = Math.floor(Math.random() * 6);
      const dice3Index = Math.floor(Math.random() * 6);
      const dice4Index = Math.floor(Math.random() * 6);
      const dice5Index = Math.floor(Math.random() * 6);
      const dice6Index = Math.floor(Math.random() * 6);

      // Calculate animation progress
      const progress = frame / totalFrames;
      const shakeIntensity = Math.floor((1 - progress) * 3) + 1;
      const shake = ' '.repeat(shakeIntensity);

      // Create multi-line dice display
      let content = '{center}🎲 Rolling Dice... 🎲{/center}\n\n';
      
      // Display each row of the dice
      for (let row = 0; row < 5; row++) {
        const dice1Row = diceFaces[dice1Index][row];
        const dice2Row = diceFaces[dice2Index][row];
        const dice3Row = diceFaces[dice3Index][row];
        const dice4Row = diceFaces[dice4Index][row];
        const dice5Row = diceFaces[dice5Index][row];
        const dice6Row = diceFaces[dice6Index][row];
        
        content += `{center}${shake}${dice1Row} ${dice2Row} ${dice3Row} ${dice4Row} ${dice5Row} ${dice6Row}${shake}{/center}\n`;
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
        
        // Show final result
        setTimeout(() => {
          this.showFinalResult([dice1Index, dice2Index, dice3Index, dice4Index, dice5Index, dice6Index]);
        }, 500);
      }
            }, 50); // Much faster animation!
  }

  private showFinalResult(diceIndices: number[]): void {
    const values = diceIndices.map(index => index + 1); // Convert 0-based to 1-based
    
    // Get the dice faces for display
    const diceFaces = [
      // Die 1
      ['┌─────┐', '│     │', '│  ●  │', '│     │', '└─────┘'],
      // Die 2  
      ['┌─────┐', '│ ●   │', '│     │', '│   ● │', '└─────┘'],
      // Die 3
      ['┌─────┐', '│ ●   │', '│  ●  │', '│   ● │', '└─────┘'],
      // Die 4
      ['┌─────┐', '│ ● ● │', '│     │', '│ ● ● │', '└─────┘'],
      // Die 5
      ['┌─────┐', '│ ● ● │', '│  ●  │', '│ ● ● │', '└─────┘'],
      // Die 6
      ['┌─────┐', '│ ● ● │', '│ ● ● │', '│ ● ● │', '└─────┘']
    ];

    let content = '{center}🎯 Final Roll! 🎯{/center}\n\n';
    
    // Display each row of the dice
    for (let row = 0; row < 5; row++) {
      const dice1Row = diceFaces[diceIndices[0]][row];
      const dice2Row = diceFaces[diceIndices[1]][row];
      const dice3Row = diceFaces[diceIndices[2]][row];
      const dice4Row = diceFaces[diceIndices[3]][row];
      const dice5Row = diceFaces[diceIndices[4]][row];
      const dice6Row = diceFaces[diceIndices[5]][row];
      
      content += `{center}${dice1Row} ${dice2Row} ${dice3Row} ${dice4Row} ${dice5Row} ${dice6Row}{/center}\n`;
    }
    
    content += `\n{center}Values: ${values.join(', ')}{/center}\n\n` +
      '{center}Press {bold}SPACE{/bold} to roll again{/center}';

    this.diceBox.setContent(content);
    this.screen.render();
  }

  private cleanup(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    this.screen.destroy();
  }

  public start(): void {
    this.screen.render();
  }
}

// Simple test runner
if (require.main === module) {
  const animation = new DiceAnimation();
  animation.start();
} 