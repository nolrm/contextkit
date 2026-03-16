const chalk = require('chalk');
const fs = require('fs-extra');

class NoteCommand {
  constructor() {
    this.correctionsPath = '.contextkit/corrections.md';
  }

  async run(message, options = {}) {
    if (!message) {
      console.log(chalk.red('❌ Please provide a message'));
      console.log(chalk.yellow('Usage: contextkit note "<message>"'));
      return;
    }

    if (!(await fs.pathExists(this.correctionsPath))) {
      console.log(chalk.red('❌ Corrections log not found'));
      console.log(chalk.yellow('   Run: contextkit install'));
      return;
    }

    try {
      const content = await fs.readFile(this.correctionsPath, 'utf-8');
      const today = new Date().toISOString().split('T')[0];

      // Find or create today's session
      const sessionHeader = `### ${today} - ${options.task || 'Development Session'}`;

      let updatedContent = content;

      // Check if today's session exists
      if (content.includes(sessionHeader)) {
        // Add to existing session
        const category = options.category || 'AI Behavior';
        const priority = options.priority || 'MEDIUM';
        const note = `- ${category} | ${message} [${priority}]`;

        // Find the session and add note to appropriate section
        const sections = ['Rule Updates', 'AI Behavior', 'Preferences', 'Trend Indicators'];
        let sectionFound = false;

        for (const section of sections) {
          if (category.toLowerCase().includes(section.toLowerCase().substring(0, 5))) {
            const sectionHeader = `#### ${section}`;
            const sectionRegex = new RegExp(`(${sectionHeader}[\\s\\S]*?)(?=####|###|##|$)`, 'm');
            const match = content.match(sectionRegex);

            if (match) {
              updatedContent = content.replace(sectionRegex, `$1\n${note}`);
              sectionFound = true;
              break;
            }
          }
        }

        if (!sectionFound) {
          // Add to AI Behavior section as default
          const aiBehaviorRegex = /(#### AI Behavior[\s\S]*?)(?=####|###|##|$)/m;
          if (content.match(aiBehaviorRegex)) {
            updatedContent = content.replace(aiBehaviorRegex, `$1\n${note}`);
          }
        }
      } else {
        // Create new session
        const newSession = `
${sessionHeader}

**Changes**: ${options.changes || 'Development work'}

#### Rule Updates

- [No updates yet]

#### AI Behavior

- ${options.category || 'AI Behavior'} | ${message} [${options.priority || 'MEDIUM'}]

#### Preferences

- [No preferences yet]

#### Trend Indicators

- [No trends yet]

`;

        // Insert after "## Recent Sessions"
        const sessionsRegex = /(## Recent Sessions\n)/;
        if (content.match(sessionsRegex)) {
          updatedContent = content.replace(sessionsRegex, `$1${newSession}`);
        } else {
          // Fallback: add at the beginning
          updatedContent = `## Recent Sessions${newSession}\n${content}`;
        }
      }

      await fs.writeFile(this.correctionsPath, updatedContent);
      console.log(chalk.green('✅ Note added to corrections log'));
      console.log(chalk.dim(`   ${message}`));
    } catch (error) {
      console.log(chalk.red('❌ Failed to add note:'), error.message);
    }
  }
}

async function note(message, options) {
  const cmd = new NoteCommand();
  await cmd.run(message, options);
}

module.exports = note;
