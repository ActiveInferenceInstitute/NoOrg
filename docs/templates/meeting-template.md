---
title: Meeting Notes Template
created: 2024-03-20
updated: 2024-03-20
tags: [template, meetings, notes, documentation]
---

# Meeting Notes Template

## 📋 Overview
This document provides standardized templates for different types of meetings, ensuring consistent documentation of discussions, decisions, and action items.

## 🎯 Meeting Types

### Project Status Meeting
```yaml
meeting_details:
  type: "Project Status"
  date: "YYYY-MM-DD"
  time: "HH:MM - HH:MM"
  location: "Room/Virtual Link"
  
attendees:
  present:
    - name: ""
      role: ""
  absent:
    - name: ""
      role: ""
      
agenda:
  - Project Updates
  - Timeline Review
  - Risk Assessment
  - Resource Planning
  
discussion_points:
  project_updates:
    - topic: ""
      status: ""
      blockers: ""
      next_steps: ""
      
  timeline_review:
    - milestone: ""
      target_date: ""
      status: ""
      adjustments: ""
      
  risk_assessment:
    - risk: ""
      impact: ""
      mitigation: ""
      owner: ""
      
  resource_planning:
    - resource: ""
      allocation: ""
      constraints: ""
      resolution: ""
```

### Technical Review Meeting
```json
{
  "meeting_details": {
    "type": "Technical Review",
    "date": "YYYY-MM-DD",
    "time": "HH:MM - HH:MM",
    "location": "Room/Virtual Link"
  },
  "attendees": {
    "present": [
      {
        "name": "",
        "role": "",
        "team": ""
      }
    ],
    "absent": [
      {
        "name": "",
        "role": "",
        "team": ""
      }
    ]
  },
  "technical_review": {
    "architecture_review": {
      "current_state": "",
      "proposed_changes": "",
      "impact_analysis": "",
      "recommendations": ""
    },
    "code_review": {
      "components": "",
      "issues_identified": "",
      "best_practices": "",
      "improvements": ""
    },
    "performance_review": {
      "metrics": "",
      "bottlenecks": "",
      "optimizations": "",
      "action_items": ""
    }
  }
}
```

### Strategic Planning Meeting
```yaml
meeting_details:
  type: "Strategic Planning"
  date: "YYYY-MM-DD"
  time: "HH:MM - HH:MM"
  location: "Room/Virtual Link"
  
attendees:
  present:
    - name: ""
      role: ""
      department: ""
  absent:
    - name: ""
      role: ""
      department: ""
      
strategic_planning:
  vision_goals:
    current_state: ""
    future_state: ""
    key_objectives: []
    
  market_analysis:
    trends: []
    opportunities: []
    threats: []
    
  resource_planning:
    human_resources: []
    financial_resources: []
    technology_resources: []
    
  implementation:
    phases: []
    timelines: []
    responsibilities: []
```

## ✅ Action Item Tracking

### Action Items Framework
```python
class ActionTracker:
    def __init__(self):
        self.action_items = {
            'tasks': {
                'id': 'unique_identifier',
                'description': 'task_description',
                'owner': 'assigned_person',
                'due_date': 'YYYY-MM-DD',
                'priority': 'high/medium/low',
                'status': 'open/in_progress/completed',
                'dependencies': ['dependent_tasks'],
                'updates': ['progress_updates']
            },
            'tracking': {
                'creation_date': 'YYYY-MM-DD',
                'last_updated': 'YYYY-MM-DD',
                'completion_date': 'YYYY-MM-DD',
                'status_history': ['status_changes']
            },
            'notifications': {
                'reminders': ['reminder_dates'],
                'escalations': ['escalation_triggers'],
                'updates': ['update_notifications']
            }
        }
        
    def track_actions(self):
        """Track action items"""
        pass
        
    def update_status(self):
        """Update action item status"""
        pass
```

### Action Items Template
```yaml
action_items:
  - id: "AI-001"
    description: ""
    owner: ""
    due_date: "YYYY-MM-DD"
    priority: "High/Medium/Low"
    status: "Open/In Progress/Completed"
    notes: ""
    updates:
      - date: "YYYY-MM-DD"
        status: ""
        notes: ""
    
  - id: "AI-002"
    description: ""
    owner: ""
    due_date: "YYYY-MM-DD"
    priority: "High/Medium/Low"
    status: "Open/In Progress/Completed"
    notes: ""
    updates:
      - date: "YYYY-MM-DD"
        status: ""
        notes: ""
```

## 📝 Decision Recording

### Decision Log
```json
{
  "decisions": {
    "technical_decisions": [
      {
        "id": "TD-001",
        "topic": "Technical Decision Topic",
        "context": "Background and context",
        "alternatives": [
          "Option 1",
          "Option 2",
          "Option 3"
        ],
        "decision": "Selected option",
        "rationale": "Decision rationale",
        "impact": "Impact assessment",
        "stakeholders": [
          "Stakeholder 1",
          "Stakeholder 2"
        ],
        "date": "YYYY-MM-DD"
      }
    ],
    "business_decisions": [
      {
        "id": "BD-001",
        "topic": "Business Decision Topic",
        "context": "Background and context",
        "options": [
          "Option 1",
          "Option 2"
        ],
        "decision": "Selected option",
        "rationale": "Decision rationale",
        "impact": "Impact assessment",
        "stakeholders": [
          "Stakeholder 1",
          "Stakeholder 2"
        ],
        "date": "YYYY-MM-DD"
      }
    ]
  }
}
```

### Decision Framework
```python
class DecisionRecorder:
    def __init__(self):
        self.decision_framework = {
            'documentation': {
                'context': self._document_context,
                'alternatives': self._document_alternatives,
                'rationale': self._document_rationale
            },
            'analysis': {
                'impact_assessment': self._assess_impact,
                'risk_analysis': self._analyze_risks,
                'stakeholder_analysis': self._analyze_stakeholders
            },
            'tracking': {
                'decision_logging': self._log_decision,
                'implementation_tracking': self._track_implementation,
                'outcome_monitoring': self._monitor_outcomes
            }
        }
        
    def record_decision(self):
        """Record decision details"""
        pass
        
    def track_implementation(self):
        """Track decision implementation"""
        pass
```

## 📊 Meeting Analytics

### Analytics Framework
```yaml
meeting_analytics:
  attendance_tracking:
    metrics:
      - attendance_rate
      - participation_level
      - engagement_score
    analysis:
      - attendance_trends
      - participation_patterns
      - engagement_analysis
      
  effectiveness_metrics:
    completion_rate:
      - action_items_completed
      - decisions_implemented
      - objectives_achieved
    time_efficiency:
      - meeting_duration
      - agenda_coverage
      - discussion_focus
      
  improvement_tracking:
    metrics:
      - feedback_scores
      - productivity_measures
      - satisfaction_ratings
    recommendations:
      - process_improvements
      - format_adjustments
      - tool_enhancements
```

## 📚 References

### Internal Documentation
- [[meeting-guidelines]]
- [[action-item-tracking]]
- [[decision-making-process]]
- [[meeting-effectiveness]]

### External Resources
- [Effective Meetings](https://example.com/effective-meetings)
- [Action Item Management](https://example.com/action-items)
- [Decision Documentation](https://example.com/decision-documentation)

## 📅 Version History
- 2024-03-20: Initial meeting notes template
- [Future updates will be logged here]

---

*Last updated: 2024-03-20* 