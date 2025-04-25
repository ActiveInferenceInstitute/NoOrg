/**
 * Mermaid Diagram Utilities
 * 
 * Functions for generating Mermaid syntax diagrams
 * for organizational structures, workflows, and other visualizations.
 */

/**
 * Generate Mermaid syntax for an organizational structure diagram
 * @param {Array} units - Organizational units
 * @param {Array} relationships - Relationships between units
 * @returns {string} Mermaid diagram syntax
 */
function generateOrgStructureDiagram(units, relationships) {
  let mermaid = 'graph TD\n';
  
  // Add nodes for each unit
  units.forEach(unit => {
    let description = unit.description;
    if (description && description.length > 30) {
      description = description.substring(0, 30) + '...';
    }
    mermaid += `  ${unit.id}["${unit.name}\n(${description})"]`;
    mermaid += '\n';
  });
  
  // Add relationships between units
  relationships.forEach(rel => {
    const source = units.find(u => u.name === rel.sourceUnit);
    const target = units.find(u => u.name === rel.targetUnit);
    
    if (source && target) {
      let description = rel.description;
      if (description && description.length > 20) {
        description = description.substring(0, 20) + '...';
      }
      mermaid += `  ${source.id} --"${rel.type}: ${description}"--> ${target.id}`;
      mermaid += '\n';
    }
  });
  
  return mermaid;
}

/**
 * Generate Mermaid syntax for a workflow diagram
 * @param {Array} workflowSteps - Steps in the workflow
 * @param {Object} options - Customization options
 * @returns {string} Mermaid diagram syntax
 */
function generateWorkflowDiagram(workflowSteps, options = {}) {
  let mermaid = 'graph TD\n';
  const stepMap = new Map();
  
  // Create node for each step
  workflowSteps.forEach((step, index) => {
    stepMap.set(index, step.id);
    
    let style = '';
    if (step.status === 'completed') {
      style = ':::completed';
    } else if (step.status === 'in_progress') {
      style = ':::inProgress';
    } else if (step.status === 'error') {
      style = ':::error';
    }
    
    mermaid += `  ${step.id}["${step.name}\n(${step.status})"]${style}`;
    mermaid += '\n';
  });
  
  // Create edges between steps
  workflowSteps.forEach((step, index) => {
    (step.dependsOn || []).forEach(depIndex => {
      const sourceId = stepMap.get(depIndex);
      if (sourceId) {
        mermaid += `  ${sourceId} --> ${step.id}`;
        mermaid += '\n';
      }
    });
  });
  
  // Add style classes
  if (options.includeStyles !== false) {
    mermaid += '\n  classDef completed fill:#d4ffda,stroke:#43a047\n';
    mermaid += '  classDef inProgress fill:#fff9c4,stroke:#ffa000\n';
    mermaid += '  classDef error fill:#ffebee,stroke:#e53935\n';
  }
  
  return mermaid;
}

/**
 * Generate Mermaid syntax for a sequence diagram of LLM API calls
 * @param {Array} llmCalls - Array of LLM API call records
 * @returns {string} Mermaid diagram syntax
 */
function generateLLMCallsDiagram(llmCalls) {
  let mermaid = 'sequenceDiagram\n';
  
  // Add participants
  mermaid += '  participant App\n';
  mermaid += '  participant OpenAI_API\n';
  
  // Add message exchanges
  llmCalls.forEach((call, index) => {
    // Request
    mermaid += `  App->>+OpenAI_API: Request ${index + 1} (${call.step})\n`;
    mermaid += `  Note over App,OpenAI_API: ${call.promptTokens} tokens\n`;
    
    // Response
    mermaid += `  OpenAI_API-->>-App: Response ${index + 1} (${call.model || 'LLM'})\n`;
    mermaid += `  Note over OpenAI_API,App: ${call.completionTokens} tokens\n`;
  });
  
  return mermaid;
}

/**
 * Create a Mermaid markdown document with diagram
 * @param {string} title - Document title
 * @param {string} mermaidSyntax - Mermaid diagram syntax
 * @param {string} description - Optional description text
 * @returns {string} Markdown content with embedded Mermaid diagram
 */
function createMermaidMarkdown(title, mermaidSyntax, description = '') {
  let md = `# ${title}\n\n`;
  
  if (description) {
    md += `${description}\n\n`;
  }
  
  md += '```mermaid\n';
  md += mermaidSyntax;
  md += '\n```\n';
  
  return md;
}

/**
 * Generate a Gantt chart for a project timeline
 * @param {Object} project - Project information
 * @param {Array} tasks - Project tasks
 * @returns {string} Mermaid Gantt chart syntax
 */
function generateGanttChart(project, tasks) {
  let mermaid = 'gantt\n';
  mermaid += `  title ${project.title || 'Project Timeline'}\n`;
  mermaid += '  dateFormat YYYY-MM-DD\n';
  mermaid += '  axisFormat %b %d\n\n';
  
  // Add sections for task groups
  const sections = [...new Set(tasks.map(task => task.section))];
  sections.forEach(section => {
    if (section) {
      mermaid += `  section ${section}\n`;
      
      // Add tasks for this section
      const sectionTasks = tasks.filter(task => task.section === section);
      sectionTasks.forEach(task => {
        const status = task.status || '';
        const duration = task.duration || '1d';
        const dependencies = task.dependencies ? `after ${task.dependencies}` : '';
        
        mermaid += `  ${task.id || task.name}: ${status}, ${task.startDate}, ${duration} ${dependencies}\n`;
      });
      
      mermaid += '\n';
    }
  });
  
  // Add tasks without sections
  const unclassifiedTasks = tasks.filter(task => !task.section);
  if (unclassifiedTasks.length > 0) {
    mermaid += '  section Other Tasks\n';
    unclassifiedTasks.forEach(task => {
      const status = task.status || '';
      const duration = task.duration || '1d';
      const dependencies = task.dependencies ? `after ${task.dependencies}` : '';
      
      mermaid += `  ${task.id || task.name}: ${status}, ${task.startDate}, ${duration} ${dependencies}\n`;
    });
  }
  
  return mermaid;
}

module.exports = {
  generateOrgStructureDiagram,
  generateWorkflowDiagram,
  generateLLMCallsDiagram,
  createMermaidMarkdown,
  generateGanttChart
}; 