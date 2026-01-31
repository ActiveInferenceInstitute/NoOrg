# Incident Response Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Security Operations Manager

## Purpose

Defines the process for detecting, responding to, and recovering from security incidents.

## Incident Categories

| Category | Examples |
|----------|----------|
| Malware | Virus, ransomware |
| Unauthorized Access | Account compromise |
| Data Breach | Data exfiltration |
| DoS/DDoS | Service disruption |
| Insider Threat | Malicious insider |
| Physical | Theft, unauthorized entry |

## Severity Classification

| Severity | Impact | Response Time |
|----------|--------|---------------|
| Critical | Business-wide | 15 min |
| High | Major system/data | 1 hour |
| Medium | Limited impact | 4 hours |
| Low | Minimal impact | 24 hours |

## Response Phases

### 1. Detection
| Source | Method |
|--------|--------|
| SIEM | Automated alerts |
| EDR | Endpoint detection |
| Users | Reported issues |
| External | Threat intelligence |

### 2. Triage
| Activity | Output |
|----------|--------|
| Initial assessment | Severity classification |
| Scope determination | Affected systems |
| Team activation | Response team engaged |
| Communication | Stakeholder notification |

### 3. Containment
| Strategy | Application |
|----------|-------------|
| Short-term | Immediate isolation |
| Long-term | Remediation planning |
| Evidence | Preserve forensics |

### 4. Eradication
| Activity | Purpose |
|----------|---------|
| Root cause | Identify source |
| Remove threat | Eliminate malware/access |
| Patch/update | Close vulnerabilities |

### 5. Recovery
| Step | Activity |
|------|----------|
| Restore | Rebuild affected systems |
| Verify | Confirm security |
| Monitor | Enhanced surveillance |
| Resume | Normal operations |

### 6. Post-Incident
| Activity | Timing |
|----------|--------|
| Report | Within 5 days |
| Lessons learned | Within 2 weeks |
| Improvements | Within 30 days |

## Related Documents

- [Information Security Policy](../Policies/Information_Security_Policy.md)
- [Business Continuity](../../Operations/Policies/)
