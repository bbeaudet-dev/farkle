import * as blessed from 'blessed';

/**
 * Flexible dice animation system with separated data and display
 * This allows for easy manipulation of individual dice
 */
export class FlexibleDiceAnimation {
  private screen: any;
  private diceBox: any;
  private animationInterval?: NodeJS.Timeout;
  private isAnimating = false;
  
  // Dice data structure - this is the key to flexibility!
  private dice: Array<{
    id: number;
    value: number;
    color: string;
    visible: boolean;
    effects: string[];
  }> = [];

  // ASCII art dice faces (same as before)
  private readonly diceFaces = [
    ['┌─────┐', '│     │', '│  ●  │', '│     │', '└─────┘'], // 1
    ['┌─────┐', '│ ●   │', '│     │', '│   ● │', '└─────┘'], // 2
    ['┌─────┐', '│ ●   │', '│  ●  │', '│   ● │', '└─────┘'], // 3
    ['┌─────┐', '│ ● ● │', '│     │', '│ ● ● │', '└─────┘'], // 4
    ['┌─────┐', '│ ● ● │', '│  ●  │', '│ ● ● │', '└─────┘'], // 5
    ['┌─────┐', '│ ● ● │', '│ ● ● │', '│ ● ● │', '└─────┘']  // 6
  ];

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Flexible Rollio Dice Animation'
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

    // Initialize 6 dice
    this.initializeDice();

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

    // Handle 's' to sort dice
    this.screen.key(['s'], () => {
      this.sortDiceByValue();
      this.renderDice();
    });

    // Handle 'h' to hide/show dice
    this.screen.key(['h'], () => {
      this.toggleDiceVisibility();
      this.renderDice();
    });

    // Handle 'c' to cycle colors
    this.screen.key(['c'], () => {
      this.cycleDiceColors();
      this.renderDice();
    });

    this.showInstructions();
  }

  private initializeDice(): void {
    this.dice = [];
    for (let i = 0; i < 6; i++) {
      this.dice.push({
        id: i,
        value: Math.floor(Math.random() * 6) + 1,
        color: 'white',
        visible: true,
        effects: []
      });
    }
  }

  private showInstructions(): void {
    this.diceBox.setContent(
      '{center}🎲 Flexible Dice Animation 🎲{/center}\n\n' +
      'Press {bold}SPACE{/bold} to roll dice\n' +
      'Press {bold}S{/bold} to sort by value\n' +
      'Press {bold}H{/bold} to hide/show dice\n' +
      'Press {bold}C{/bold} to cycle colors\n' +
      'Press {bold}Q{/bold} to exit\n\n' +
      'Ready to roll!'
    );
    this.screen.render();
  }

  // === DICE MANIPULATION METHODS ===
  
  public sortDiceByValue(): void {
    this.dice.sort((a, b) => a.value - b.value);
  }

  public toggleDiceVisibility(): void {
    // Hide dice with values 1-3, show dice with values 4-6
    this.dice.forEach(die => {
      die.visible = die.value >= 4;
    });
  }

  public cycleDiceColors(): void {
    const colors = ['white', 'red', 'green', 'yellow', 'blue', 'magenta'];
    this.dice.forEach((die, index) => {
      const colorIndex = (index + Math.floor(Math.random() * colors.length)) % colors.length;
      die.color = colors[colorIndex];
    });
  }

  public removeDiceWithValue(value: number): void {
    this.dice = this.dice.filter(die => die.value !== value);
  }

  public addEffectToDice(dieId: number, effect: string): void {
    const die = this.dice.find(d => d.id === dieId);
    if (die) {
      die.effects.push(effect);
    }
  }

  // === RENDERING METHODS ===

  private renderDice(): void {
    const visibleDice = this.dice.filter(die => die.visible);
    
    let content = '{center}🎯 Current Dice State 🎯{/center}\n\n';
    
    // Display each row of the dice
    for (let row = 0; row < 5; row++) {
      let rowContent = '{center}';
      
      visibleDice.forEach(die => {
        const dieRow = this.diceFaces[die.value - 1][row];
        const colorTag = `{${die.color}-fg}`;
        const effectTag = die.effects.length > 0 ? '{bold}' : '';
        
        rowContent += `${colorTag}${effectTag}${dieRow}{/} `;
      });
      
      rowContent += '{/center}\n';
      content += rowContent;
    }
    
    // Show dice info
    content += '\n{center}Dice: ' + visibleDice.map(d => 
      `${d.value}${d.effects.length > 0 ? '*' : ''}`
    ).join(', ') + '{/center}\n';
    
    content += '{center}Press SPACE to roll, S to sort, H to hide, C for colors{/center}';

    this.diceBox.setContent(content);
    this.screen.render();
  }

  private animateDiceRoll(): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    let frame = 0;
    const totalFrames = 30;

    this.animationInterval = setInterval(() => {
      frame++;
      
      // Randomize all dice values for animation
      this.dice.forEach(die => {
        die.value = Math.floor(Math.random() * 6) + 1;
      });

      // Calculate shake effect
      const progress = frame / totalFrames;
      const shakeIntensity = Math.floor((1 - progress) * 3) + 1;
      const shake = ' '.repeat(shakeIntensity);

      // Create animated display
      let content = '{center}🎲 Rolling Dice... 🎲{/center}\n\n';
      
      for (let row = 0; row < 5; row++) {
        let rowContent = `{center}${shake}`;
        
        this.dice.forEach(die => {
          const dieRow = this.diceFaces[die.value - 1][row];
          rowContent += `${dieRow} `;
        });
        
        rowContent += `${shake}{/center}\n`;
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
        
        // Show final result with manipulation options
        setTimeout(() => {
          this.renderDice();
        }, 500);
      }
    }, 50);
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

// Test runner
if (require.main === module) {
  const animation = new FlexibleDiceAnimation();
  animation.start();
} 