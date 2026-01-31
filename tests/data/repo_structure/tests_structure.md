# Repository Structure

Generated: 2026-01-02T15:05:04.326093
Root: /Users/4d/Documents/GitHub/NoOrg/tests

## Directory Tree
```text
/Users/4d/Documents/GitHub/NoOrg/tests
└── tests/
    ├── config/
    │   ├── AGENTS.md (368 bytes)
    │   ├── README.md (460 bytes)
    │   ├── jest.setup.ts (858 bytes)
    │   ├── pytest.ini (1477 bytes)
    │   └── tsconfig.json (266 bytes)
    ├── data/
    │   ├── codebase_relationships/
    │   │   ├── README.md (1151 bytes)
    │   │   ├── dependency_metrics.json (185 bytes)
    │   │   ├── dependency_metrics.md (227 bytes)
    │   │   ├── markdown_links.json (281412 bytes)
    │   │   ├── python_dependencies.json (84177 bytes)
    │   │   └── typescript_dependencies.json (70311 bytes)
    │   ├── metrics/
    │   │   └── sample_metrics.json (3548 bytes)
    │   ├── repo_structure/
    │   │   ├── README.md (1071 bytes)
    │   │   ├── agents_structure.json (25730 bytes)
    │   │   ├── agents_structure.md (7107 bytes)
    │   │   ├── docs_structure.json (127409 bytes)
    │   │   ├── docs_structure.md (31431 bytes)
    │   │   ├── file_extensions.json (1182 bytes)
    │   │   ├── file_extensions.md (1256 bytes)
    │   │   ├── frameworks_structure.json (22434 bytes)
    │   │   ├── frameworks_structure.md (5486 bytes)
    │   │   ├── operations_structure.json (241 bytes)
    │   │   ├── operations_structure.md (202 bytes)
    │   │   ├── repository_structure.json (822104 bytes)
    │   │   ├── repository_structure.md (199786 bytes)
    │   │   ├── tests_structure.json (46730 bytes)
    │   │   └── tests_structure.md (11787 bytes)
    │   ├── resources/
    │   │   └── resource_pools.json (2788 bytes)
    │   ├── tasks/
    │   │   └── sample_tasks.json (2190 bytes)
    │   ├── AGENTS.md (516 bytes)
    │   ├── README.md (2048 bytes)
    │   └── schemas.json (1 bytes)
    ├── fixtures/
    ├── integration/
    │   ├── multiagent/
    │   │   ├── AGENTS.md (308 bytes)
    │   │   ├── README.md (448 bytes)
    │   │   ├── test_agent_coordination.ts (14381 bytes)
    │   │   └── test_coordinator_and_registry.ts (8246 bytes)
    │   ├── task/
    │   │   ├── AGENTS.md (201 bytes)
    │   │   ├── README.md (326 bytes)
    │   │   ├── __init__.py (0 bytes)
    │   │   └── test_task_execution.py (11163 bytes)
    │   ├── AGENTS.md (600 bytes)
    │   ├── README.md (424 bytes)
    │   ├── __init__.py (0 bytes)
    │   ├── llm-agent-communication.test.ts (19883 bytes)
    │   ├── test_comprehensive_system_integration.ts (25685 bytes)
    │   └── test_real_multiagent_workflow.py (20427 bytes)
    ├── logs/
    │   ├── test-run-2025-03-28T18-36-10.168Z.log (28774 bytes)
    │   ├── test_agent_coordination-2025-03-28T18-36-10.168Z.log (11034 bytes)
    │   ├── test_coordinator_and_registry-2025-03-28T18-36-10.168Z.log (1606 bytes)
    │   ├── test_end_to_end_workflow-2025-03-28T18-36-10.168Z.log (2671 bytes)
    │   ├── test_openai_client-2025-03-28T18-36-10.168Z.log (1523 bytes)
    │   ├── test_shared_state_manager-2025-03-28T18-36-10.168Z.log (2006 bytes)
    │   └── test_task_manager-2025-03-28T18-36-10.168Z.log (6324 bytes)
    ├── output/
    │   └── qualifier-prep-2025-04-21T18-49-16-662Z/
    │       ├── intermediate_steps/
    │       │   ├── step_02_Planner_Pro_planning_prompt.json (1401 bytes)
    │       │   ├── step_02_Planner_Pro_planning_response.json (3890 bytes)
    │       │   ├── step_02_Planner_Pro_planning_result.txt (2964 bytes)
    │       │   ├── step_03_Researcher_Alpha_research_prompt.json (4624 bytes)
    │       │   ├── step_03_Researcher_Alpha_research_response.json (6782 bytes)
    │       │   ├── step_03_Researcher_Alpha_research_result.txt (5911 bytes)
    │       │   ├── step_04_Synthesizer_Supreme_synthesis_prompt.json (10655 bytes)
    │       │   ├── step_04_Synthesizer_Supreme_synthesis_response.json (5282 bytes)
    │       │   ├── step_04_Synthesizer_Supreme_synthesis_result.txt (4438 bytes)
    │       │   ├── step_05_Outline_Architect_outlining_prompt.json (15178 bytes)
    │       │   ├── step_05_Outline_Architect_outlining_response.json (4700 bytes)
    │       │   ├── step_05_Outline_Architect_outlining_result.txt (3780 bytes)
    │       │   ├── step_06_Academic_Writer_writing_prompt.json (19214 bytes)
    │       │   ├── step_06_Academic_Writer_writing_response.json (17634 bytes)
    │       │   ├── step_06_Academic_Writer_writing_result.txt (16521 bytes)
    │       │   ├── step_07_Editor_Extraordinaire_editing_prompt.json (35943 bytes)
    │       │   ├── step_07_Editor_Extraordinaire_editing_response.json (17625 bytes)
    │       │   ├── step_07_Editor_Extraordinaire_editing_result.txt (16506 bytes)
    │       │   ├── step_08_Markdown_Master_formatting_prompt.json (52739 bytes)
    │       │   ├── step_08_Markdown_Master_formatting_response.json (17820 bytes)
    │       │   └── step_08_Markdown_Master_formatting_result.txt (16729 bytes)
    │       ├── _workflow_report.json (7049 bytes)
    │       ├── _workflow_visualization.mmd (731 bytes)
    │       ├── _workflow_visualization.png (28440 bytes)
    │       └── final_qualifier_document.md (16814 bytes)
    ├── performance/
    │   ├── AGENTS.md (197 bytes)
    │   ├── README.md (317 bytes)
    │   └── test_coordinator_performance.py (15247 bytes)
    ├── reports/
    │   ├── AGENTS.md (418 bytes)
    │   ├── README.md (281 bytes)
    │   ├── component-verification-2025-03-28T18-36-10.168Z.json (2949 bytes)
    │   ├── final_test_summary.md (1785 bytes)
    │   ├── test-report-2025-03-28T18-36-10.168Z.md (3378 bytes)
    │   ├── test-summary-2025-03-28T18-36-10.168Z.md (650 bytes)
    │   └── test_report.md (6684 bytes)
    ├── runners/
    │   ├── AGENTS.md (200 bytes)
    │   ├── README.md (301 bytes)
    │   ├── run_js.js (7320 bytes)
    │   └── run_py.py (6136 bytes)
    ├── system/
    │   ├── multiagent/
    │   │   ├── AGENTS.md (343 bytes)
    │   │   ├── README.md (474 bytes)
    │   │   ├── test_end_to_end_workflow.ts (12763 bytes)
    │   │   ├── test_organizational_units.ts (10505 bytes)
    │   │   └── test_real_llm_workflow.ts (15119 bytes)
    │   ├── scenarios/
    │   │   ├── AGENTS.md (180 bytes)
    │   │   ├── README.md (299 bytes)
    │   │   ├── __init__.py (0 bytes)
    │   │   └── test_task_workflow.py (12818 bytes)
    │   ├── AGENTS.md (481 bytes)
    │   ├── README.md (444 bytes)
    │   ├── __init__.py (0 bytes)
    │   └── test_end_to_end_multiagent.ts (15397 bytes)
    ├── tests/
    │   ├── integration/
    │   │   ├── task/
    │   │   │   └── __init__.py (0 bytes)
    │   │   └── __init__.py (0 bytes)
    │   ├── system/
    │   │   ├── scenarios/
    │   │   │   └── __init__.py (0 bytes)
    │   │   └── __init__.py (0 bytes)
    │   ├── unit/
    │   │   ├── task/
    │   │   │   └── __init__.py (0 bytes)
    │   │   └── __init__.py (0 bytes)
    │   └── __init__.py (0 bytes)
    ├── unit/
    │   ├── agents/
    │   │   ├── AGENTS.md (7538 bytes)
    │   │   ├── test_active_inference_pomdp_agent.ts (15427 bytes)
    │   │   ├── test_analysis_agent.ts (17572 bytes)
    │   │   ├── test_creative_writing_agent.ts (17174 bytes)
    │   │   ├── test_customer_support_agent.ts (21782 bytes)
    │   │   ├── test_data_analysis_agent.ts (20902 bytes)
    │   │   ├── test_development_agent.ts (18702 bytes)
    │   │   ├── test_finance_agent.ts (16731 bytes)
    │   │   ├── test_hr_agent.ts (19727 bytes)
    │   │   ├── test_legal_agent.ts (19677 bytes)
    │   │   └── test_marketing_agent.ts (15947 bytes)
    │   ├── core/
    │   │   ├── AGENTS.md (370 bytes)
    │   │   ├── README.md (533 bytes)
    │   │   ├── test_event_system.ts (9264 bytes)
    │   │   ├── test_message_system.ts (14259 bytes)
    │   │   ├── test_monitoring_system.ts (13633 bytes)
    │   │   └── test_storage_system.ts (18018 bytes)
    │   ├── integration/
    │   │   ├── RateLimiterTest.ts (6028 bytes)
    │   │   └── RetryTest.ts (4205 bytes)
    │   ├── multiagent/
    │   │   ├── AGENTS.md (312 bytes)
    │   │   ├── README.md (454 bytes)
    │   │   ├── test_openai_client.ts (8113 bytes)
    │   │   ├── test_shared_state_manager.ts (12502 bytes)
    │   │   └── test_task_manager.ts (22658 bytes)
    │   ├── task/
    │   │   ├── AGENTS.md (440 bytes)
    │   │   ├── README.md (567 bytes)
    │   │   ├── __init__.py (0 bytes)
    │   │   ├── test_task_dependencies.py (8724 bytes)
    │   │   ├── test_task_ingestion.py (6851 bytes)
    │   │   ├── test_task_prioritization.py (7528 bytes)
    │   │   ├── test_task_scheduling.py (1 bytes)
    │   │   └── test_task_workflow.py (10724 bytes)
    │   ├── AGENTS.md (1017 bytes)
    │   ├── README.md (557 bytes)
    │   ├── __init__.py (0 bytes)
    │   └── agent-coordination.test.ts (13354 bytes)
    ├── utils/
    │   ├── reporting/
    │   │   ├── final_test_summary.js (3955 bytes)
    │   │   └── test_report.js (7596 bytes)
    │   ├── verification/
    │   │   ├── manual_test.js (1854 bytes)
    │   │   └── test_manual_workflow.js (7142 bytes)
    │   ├── AGENTS.md (559 bytes)
    │   ├── README.md (1926 bytes)
    │   ├── __init__.py (130 bytes)
    │   ├── file_structure_mapper.py (8230 bytes)
    │   ├── test-helpers.ts (10214 bytes)
    │   └── test_helpers.ts (8107 bytes)
    ├── AGENTS.md (26221 bytes)
    ├── README.md (10029 bytes)
    ├── TEST_FIXES_SUMMARY.md (5786 bytes)
    ├── TEST_SUITE_REPORT.md (6677 bytes)
    ├── __init__.py (0 bytes)
    ├── conftest.py (10394 bytes)
    ├── multiagent-collaboration-test.js (21551 bytes)
    ├── multiagent-tests-README.md (3801 bytes)
    ├── organization-units-demo.js (4480 bytes)
    ├── package.json (1511 bytes)
    ├── phd-qualifier-prep-test.js (37375 bytes)
    ├── requirements.txt (972 bytes)
    ├── simple-openai-test.js (3293 bytes)
    ├── test_codebase_relationships.py (9234 bytes)
    ├── test_repo_structure.py (7799 bytes)
    ├── test_workflow.py (6835 bytes)
    └── utils.py (12093 bytes)
```text