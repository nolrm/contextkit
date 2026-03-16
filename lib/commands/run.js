const chalk = require('chalk');
const fs = require('fs-extra');

class RunCommand {
  constructor() {
    this.workflowPath = null;
    this.workflowContent = null;
    this.currentStep = 0;
    this.steps = [];
  }

  async run(workflowName, options = {}) {
    console.log(chalk.magenta(`🚀 Running workflow: ${workflowName}\n`));

    // Find workflow file
    const possiblePaths = [
      `.contextkit/instructions/core/${workflowName}.md`,
      `.contextkit/instructions/${workflowName}.md`,
      `.contextkit/commands/${workflowName}.md`,
    ];

    let workflowPath = null;
    for (const possiblePath of possiblePaths) {
      if (await fs.pathExists(possiblePath)) {
        workflowPath = possiblePath;
        break;
      }
    }

    if (!workflowPath) {
      console.log(chalk.red(`❌ Workflow not found: ${workflowName}`));
      console.log(chalk.yellow('   Searched in:'));
      possiblePaths.forEach((p) => console.log(chalk.dim(`     - ${p}`)));
      return;
    }

    this.workflowPath = workflowPath;
    this.workflowContent = await fs.readFile(workflowPath, 'utf-8');

    // Parse workflow
    const parsed = this.parseWorkflow(this.workflowContent);

    if (!parsed) {
      console.log(chalk.red('❌ Failed to parse workflow'));
      return;
    }

    // Execute pre-flight checks
    if (parsed.preFlight) {
      await this.executePreFlight(parsed.preFlight);
    }

    // Execute workflow steps
    if (parsed.steps && parsed.steps.length > 0) {
      console.log(chalk.blue(`\n📋 Executing ${parsed.steps.length} step(s)...\n`));

      for (let i = 0; i < parsed.steps.length; i++) {
        const step = parsed.steps[i];
        this.currentStep = i + 1;

        console.log(chalk.cyan(`\n${'─'.repeat(60)}`));
        console.log(chalk.bold(`Step ${step.number}: ${step.name || 'Unnamed Step'}`));
        console.log(chalk.cyan(`${'─'.repeat(60)}\n`));

        await this.executeStep(step, options);
      }
    }

    // Execute post-flight checks
    if (parsed.postFlight) {
      await this.executePostFlight(parsed.postFlight);
    }

    console.log(chalk.green('\n✅ Workflow completed successfully!\n'));
  }

  parseWorkflow(content) {
    const result = {
      preFlight: null,
      steps: [],
      postFlight: null,
    };

    // Extract pre-flight
    const preFlightMatch = content.match(/<pre_flight_check>([\s\S]*?)<\/pre_flight_check>/);
    if (preFlightMatch) {
      result.preFlight = preFlightMatch[1].trim();
    }

    // Extract process_flow and steps
    const processFlowMatch = content.match(/<process_flow>([\s\S]*?)<\/process_flow>/);
    if (processFlowMatch) {
      const processFlow = processFlowMatch[1];

      // Extract all steps
      const stepRegex =
        /<step\s+number="(\d+)"(?:\s+subagent="([^"]+)")?(?:\s+name="([^"]+)")?>([\s\S]*?)<\/step>/g;
      let stepMatch;

      while ((stepMatch = stepRegex.exec(processFlow)) !== null) {
        result.steps.push({
          number: parseInt(stepMatch[1]),
          subagent: stepMatch[2] || null,
          name: stepMatch[3] || null,
          content: stepMatch[4].trim(),
        });
      }
    }

    // Extract post-flight
    const postFlightMatch = content.match(/<post_flight_check>([\s\S]*?)<\/post_flight_check>/);
    if (postFlightMatch) {
      result.postFlight = postFlightMatch[1].trim();
    }

    return result;
  }

  async executePreFlight(preFlightContent) {
    console.log(chalk.blue('🔍 Pre-flight checks...\n'));

    // Check for EXECUTE directive
    const executeMatch = preFlightContent.match(/EXECUTE:\s*(.+)/);
    if (executeMatch) {
      const filePath = executeMatch[1].trim().replace('@.contextkit/', '.contextkit/');

      if (await fs.pathExists(filePath)) {
        const preFlightFile = await fs.readFile(filePath, 'utf-8');
        console.log(chalk.dim(preFlightFile));
        console.log('');
      } else {
        console.log(chalk.yellow(`⚠️  Pre-flight file not found: ${filePath}`));
      }
    } else {
      console.log(chalk.dim(preFlightContent));
    }
  }

  async executeStep(step, options) {
    // Display step content
    console.log(chalk.dim(step.content));
    console.log('');

    // Handle subagent (for now, just note it)
    if (step.subagent) {
      console.log(chalk.yellow(`📌 Subagent: ${step.subagent}`));
      console.log(chalk.dim('   (Subagent delegation would happen here in full implementation)'));
      console.log('');
    }

    // Extract instructions from step content
    const instructions = this.extractInstructions(step.content);

    // For now, display instructions and wait for user/AI to execute
    if (instructions.length > 0) {
      console.log(chalk.blue('📝 Instructions to execute:'));
      instructions.forEach((inst, idx) => {
        console.log(chalk.cyan(`   ${idx + 1}. ${inst}`));
      });
      console.log('');
      console.log(chalk.yellow('💡 Use your AI assistant to execute these instructions'));
      console.log(chalk.yellow('   Or continue manually following the workflow steps\n'));
    }

    // In interactive mode, wait for confirmation
    if (options.interactive) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        readline.question(chalk.yellow('Press Enter to continue to next step...'), () => {
          readline.close();
          resolve();
        });
      });
    }
  }

  extractInstructions(content) {
    const instructions = [];

    // Extract ACTION directives
    const actionMatches = content.matchAll(/ACTION:\s*(.+)/gi);
    for (const match of actionMatches) {
      instructions.push(match[1].trim());
    }

    // Extract numbered steps
    const stepMatches = content.matchAll(/^\d+\.\s+(.+)$/gm);
    for (const match of stepMatches) {
      instructions.push(match[1].trim());
    }

    return instructions;
  }

  async executePostFlight(postFlightContent) {
    console.log(chalk.blue('\n🔍 Post-flight checks...\n'));

    // Check for EXECUTE directive
    const executeMatch = postFlightContent.match(/EXECUTE:\s*(.+)/);
    if (executeMatch) {
      const filePath = executeMatch[1].trim().replace('@.contextkit/', '.contextkit/');

      if (await fs.pathExists(filePath)) {
        const postFlightFile = await fs.readFile(filePath, 'utf-8');
        console.log(chalk.dim(postFlightFile));
        console.log('');

        // Check for corrections log update instructions
        if (postFlightFile.includes('corrections log')) {
          console.log(chalk.yellow('💡 Remember to update corrections.md if any issues occurred'));
        }
      } else {
        console.log(chalk.yellow(`⚠️  Post-flight file not found: ${filePath}`));
      }
    } else {
      console.log(chalk.dim(postFlightContent));
    }
  }
}

async function run(workflowName, options) {
  const cmd = new RunCommand();
  await cmd.run(workflowName, options);
}

module.exports = run;
