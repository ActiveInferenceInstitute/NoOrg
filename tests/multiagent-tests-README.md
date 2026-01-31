# Multiagent Test System

This directory contains tests and utilities for testing multiagent systems with real LLM integration.

## Overview

The multiagent test system allows you to:

1. Run tests with real LLM integration instead of mocks
2. Test agent collaboration and coordination in various scenarios
3. Measure token usage, processing times, and other performance metrics
4. Generate detailed reports of multiagent workflows

## Test Scripts

### Simple OpenAI API Test

The `simple-openai-test.js` script provides a basic test of OpenAI API integration. It sends three predefined prompts to the OpenAI API and logs the responses and usage statistics.

```bash
node tests/simple-openai-test.js
```text

### Multiagent Collaboration Test

The `multiagent-collaboration-test.js` script demonstrates a full multiagent workflow with four specialized agents:

- Research Agent: Gathers information on a topic
- Analysis Agent: Analyzes the research findings
- Writing Agent: Creates a comprehensive report
- Summary Agent: Generates an executive summary

```bash
# Run with default topic
node tests/multiagent-collaboration-test.js

# Run with a custom topic
node tests/multiagent-collaboration-test.js "Your topic here"
```text

The script generates:

- JSON output with all results and statistics
- Markdown report with formatted sections
- Detailed console logs of each step

### Run Specific Integration/Unit Tests

The `run-multiagent-test.js` script allows you to run specific TypeScript test files with real LLM integration:

```bash
node tests/run-multiagent-test.js tests/integration/multiagent/test_agent_coordination.ts
```text

### Run All Multiagent Tests

The `run-multiagent-tests.js` script runs all multiagent tests with real LLM integration:

```bash
node tests/run-multiagent-tests.js
```text

## Environment Setup

Create a `.env` file in the project root with your OpenAI API key:

```text
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo  # Optional, defaults to gpt-3.5-turbo
```text

## Test Helper Utilities

The `tests/utils/test-helpers.ts` file provides utilities for creating test fixtures, creating real LLM clients, and setting up test scenarios.

## Example: End-to-End Workflow Test

The `tests/system/multiagent/test_real_llm_workflow.ts` file demonstrates an end-to-end test for a multiagent system, including:

- Agent registration
- Task creation and assignment
- Agent collaboration
- Result evaluation

## Best Practices for Testing with Real LLMs

1. **Manage costs**: Be aware of token usage in your tests to control costs
2. **Use timeouts**: LLM requests can take time, so set appropriate timeouts for your tests
3. **Handle rate limits**: Implement retries or queuing if you hit API rate limits
4. **Test reliability**: Consider that LLM outputs may vary, so design tests that handle variability
5. **Mock when appropriate**: For unit tests, continue to use mocks where precise outputs are needed

## Extending the Test System

To add new tests:

1. Create a new test file in the appropriate directory (unit, integration, or system)
2. Import the necessary utilities from `test-helpers.ts`
3. Set up your test scenario with real LLM clients
4. Run the test using one of the test runner scripts

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is correctly set in the `.env` file
- **Timeout Errors**: Increase the timeout value for tests that involve multiple LLM calls
- **TypeScript Errors**: Make sure you've installed all development dependencies with `npm install`
- **Rate Limiting**: If you hit rate limits, add delays between API calls or use a different API key

## Token Usage Tracking

All test scripts include token usage tracking to help you monitor API costs. Usage statistics are logged to the console and included in test reports. 