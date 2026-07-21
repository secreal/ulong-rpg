# Skill Dependency Review

| Target | Prerequisite targets | Rationale |
| --- | --- | --- |
| `skill:abuse-case-modeling` | `skill:requirement` | Abuse cases extend ordinary requirements with hostile and misuse paths. |
| `skill:acceptance-criteria-writing` | `skill:requirement` | Acceptance criteria turn a requirement into observable completion conditions. |
| `skill:access-control-design` | `skill:access-control` | Access-control concepts are the direct basis for designing permissions and boundaries. |
| `skill:access-management` | `skill:access-control` | Access management operationalizes access-control rules across their lifecycle. |
| `skill:agent-workflow-design` | `skill:flow` | Agent workflows require a clear sequence of states, decisions, and handoffs. |
| `skill:app-release` | `skill:version-control` | A release needs a known, versioned application state before it can be shipped. |
| `skill:application-monitoring` | `skill:dashboard-reading` | Monitoring starts with correctly reading operational signals and dashboards. |
| `skill:architecture-governance` | `skill:documentation` | Governance depends on explicit, reviewable architecture decisions and standards. |
| `skill:architecture-tradeoff-analysis` | `skill:requirement` | Architecture tradeoffs can only be judged against known requirements and constraints. |
| `skill:attack-narrative-writing` | `skill:documentation` | An attack narrative is structured documentation of evidence, sequence, and impact. |
| `skill:audit-evidence-collection` | `skill:documentation` | Audit evidence must be captured with clear context, provenance, and organization. |
| `skill:automation-architecture` | `skill:flow` | Automation architecture begins with the workflow and decisions being automated. |
| `skill:availability-planning` | `skill:server-administration` | Availability planning builds on how servers run, fail, and are maintained. |
| `skill:backlog-prioritization` | `skill:requirement` | Prioritization requires understanding the value and constraints of each requirement. |
| `skill:board-level-risk-reporting` | `skill:documentation` | Board reporting requires concise, traceable documentation of risk and impact. |
| `skill:bottleneck-isolation` | `talent:root-cause-analysis` | Isolating a bottleneck is a focused root-cause analysis of constrained throughput. |
| `skill:capacity-forecasting` | `skill:statistical-reasoning` | Capacity forecasts depend on interpreting trends, variation, and uncertainty. |
| `skill:ci-test-orchestration` | `skill:test-case` | CI orchestration needs defined tests before it can schedule and evaluate them. |
| `skill:cloud-networking` | `skill:tcp-ip` | Cloud networks still rely on TCP/IP addressing, transport, and connectivity concepts. |
| `skill:code-review-strategy` | `skill:version-control` | Code review is grounded in understanding versioned changes and their history. |
| `skill:compliance-gap-analysis` | `skill:requirement` | A compliance gap is measured against an explicit obligation or control requirement. |
| `skill:compute-provisioning` | `skill:server-administration` | Provisioning compute requires basic knowledge of server resources and operation. |
| `skill:conflict-resolution` | `skill:escalation-handling` | Escalation handling provides a foundation for de-escalating and resolving blocked disagreements. |
| `skill:container-operations` | `skill:server-administration` | Container operation builds on process, resource, and host administration basics. |
| `skill:context-window-management` | `skill:documentation` | Managing limited context requires selecting and structuring durable information clearly. |
| `skill:contract-negotiation` | `skill:api-design` | Integration contracts build directly on API boundaries, inputs, outputs, and guarantees. |
| `skill:control-mapping` | `skill:requirement` | Control mapping relates each control to an explicit requirement or obligation. |
| `skill:cost-monitoring` | `skill:dashboard-reading` | Cost monitoring starts with reading usage, trend, and budget signals correctly. |
| `skill:cross-functional-critique-facilitation` | `skill:user-guidance` | Useful critique facilitation depends on giving clear, actionable guidance across disciplines. |
| `skill:cross-layer-debugging` | `skill:log-analysis` | Cross-layer debugging needs evidence from logs before behavior can be correlated across boundaries. |
| `skill:cross-team-dependency-management` | `skill:flow` | Cross-team dependencies are ordered handoffs within a larger delivery flow. |
| `skill:customer-impact-analysis` | `skill:ticket-handling` | Customer tickets provide the concrete symptoms, scope, and affected-user evidence. |
| `skill:cyber-risk-governance` | `skill:threat-detection` | Cyber-risk decisions require a basic understanding of threats and observable exposure. |
| `skill:dashboard-performance-tuning` | `skill:dashboard-reading` | A dashboard must be understood functionally before its performance can be tuned. |
| `skill:data-correction` | `skill:data-querying` | Safe correction starts by locating and verifying the affected records with queries. |
| `skill:data-freshness-validation` | `skill:data-querying` | Freshness checks query timestamps, update windows, and expected data arrivals. |
| `skill:data-lookup` | `skill:data-querying` | Data lookup is a direct application of selecting and filtering stored data. |
| `skill:data-quality-enforcement` | `skill:data-modeling` | Quality rules depend on the entities, constraints, and relationships in the data model. |
| `skill:delivery-forecasting` | `skill:statistical-reasoning` | Delivery forecasts require reasoning from historical variation rather than a single estimate. |
| `skill:delivery-risk-balancing` | `talent:agile-scrum` | Balancing delivery risk builds on iterative planning, feedback, and team cadence. |
| `skill:dependency-tracking` | `skill:flow` | Dependencies become trackable once work order and handoffs are mapped as a flow. |
| `skill:deployment-rollback-planning` | `skill:backup-recovery` | Rollback planning relies on restoring a known-good state when deployment fails. |
| `skill:design-system-planning` | `skill:visual-hierarchy` | A design system starts from consistent visual relationships and hierarchy. |
| `skill:detection-control-validation` | `skill:threat-detection` | Detection controls can only be validated against the threats and signals they should identify. |
| `skill:device-integration` | `skill:api-integration` | Device integration depends on exchanging data through a defined external interface. |
| `skill:endpoint-protection-planning` | `skill:patch-management` | Patch management is a core operational baseline for endpoint protection. |
| `skill:engineering-planning-facilitation` | `talent:agile-scrum` | Engineering planning facilitation builds on iterative scope, cadence, and team commitments. |
| `skill:environment-parity-management` | `skill:version-control` | Parity improves when environment definitions and configuration changes are versioned. |
| `skill:error-analysis` | `talent:root-cause-analysis` | Error analysis traces observed failure evidence to its underlying cause. |
| `skill:error-budget-analysis` | `skill:statistical-reasoning` | Error budgets require calculating and interpreting reliability measurements over time. |
| `skill:escalation-packet-writing` | `skill:escalation-handling` | A useful escalation packet formalizes the evidence and context needed for escalation. |
| `skill:exception-review` | `skill:requirement` | An exception can only be assessed relative to the rule or requirement it departs from. |
| `skill:executive-communication` | `skill:documentation` | Executive communication requires concise written structure, evidence, and decisions. |
| `skill:experience-strategy` | `talent:user-research` | Experience strategy should begin with evidence about users, needs, and behavior. |
| `skill:experiment-design` | `skill:statistical-reasoning` | Experiment design depends on variables, comparison, uncertainty, and valid inference. |
| `skill:experiment-prioritization` | `skill:statistical-reasoning` | Prioritizing experiments requires judging expected evidence and uncertainty. |
| `skill:exploit-validation` | `skill:test-case` | Exploit validation needs controlled, repeatable steps and an explicit expected result. |
| `skill:failover-rehearsal` | `skill:backup-recovery` | A failover rehearsal builds on restoring service and data through recovery procedures. |
| `skill:feature-engineering` | `skill:data-modeling` | Features must represent source entities and relationships in a usable data structure. |
| `skill:firewall-rule-governance` | `skill:firewall` | Rule governance requires understanding how firewall rules permit and deny traffic. |
| `skill:flake-investigation` | `talent:root-cause-analysis` | Flake investigation separates intermittent symptoms from their underlying causes. |
| `skill:guardrail-design` | `skill:requirement` | Guardrails encode explicit constraints and unacceptable outcomes. |
| `skill:hiring-loop-design` | `skill:requirement` | A hiring loop starts from explicit role requirements and evidence criteria. |
| `skill:incident-command` | `skill:escalation-handling` | Incident command builds on escalation paths, ownership transfer, and urgency handling. |
| `skill:incident-handling` | `skill:alert-triage` | Incident handling starts by validating, prioritizing, and routing incoming signals. |
| `skill:incremental-loading` | `skill:data-querying` | Incremental loads depend on selecting only new or changed records correctly. |
| `skill:index-strategy` | `skill:data-querying` | Index choices must be grounded in the query patterns they are meant to accelerate. |
| `skill:information-architecture` | `skill:visual-hierarchy` | Information architecture begins with meaningful hierarchy and grouping. |
| `skill:infrastructure-provisioning` | `skill:server-administration` | Provisioning infrastructure requires understanding the systems and resources being created. |
| `skill:integration-boundary-mapping` | `skill:api-integration` | Integration boundaries are discovered through interfaces, data exchange, and ownership. |
| `skill:interaction-flow-validation` | `skill:flow` | Validating an interaction requires first understanding its sequence and branches. |
| `skill:interaction-system-design` | `skill:flow` | An interaction system coordinates reusable states, transitions, and user flows. |
| `skill:issue-reproduction` | `skill:test-case` | Reproduction requires repeatable steps, inputs, environment, and expected versus actual results. |
| `skill:journey-mapping` | `talent:user-research` | Journey maps should be grounded in observed user goals, actions, and pain points. |
| `skill:lineage-tracking` | `skill:data-modeling` | Lineage follows how modeled data entities and fields transform between systems. |
| `skill:log-correlation` | `skill:log-analysis` | Correlation extends basic log interpretation across sources and timestamps. |
| `skill:managed-service-evaluation` | `skill:requirement` | A managed service should be evaluated against explicit functional and operational needs. |
| `skill:metric-design` | `skill:statistical-reasoning` | A sound metric requires valid measurement, aggregation, and interpretation. |
| `skill:metric-layer-design` | `skill:data-modeling` | A metric layer depends on consistent entities, dimensions, and relationships. |
| `skill:migration-planning` | `skill:backup-recovery` | Migration planning needs a recoverable baseline and a credible fallback state. |
| `skill:mobile-screen-building` | `skill:responsive-layout` | Mobile screens require layouts that adapt cleanly to constrained viewport sizes. |
| `skill:model-drift-monitoring` | `skill:statistical-reasoning` | Drift monitoring compares distributions and performance changes over time. |
| `skill:model-evaluation` | `skill:statistical-reasoning` | Model evaluation depends on choosing and interpreting valid quantitative measures. |
| `skill:model-training` | `skill:data-modeling` | Training requires data represented as coherent inputs, targets, and relationships. |
| `skill:observability-design` | `skill:log-analysis` | Observability design starts from the diagnostic evidence operators need from systems. |
| `skill:offline-handling` | `skill:background-processing` | Offline behavior relies on deferred work that can resume and synchronize later. |
| `skill:opportunity-framing` | `talent:user-research` | Product opportunities should be framed from validated user needs and evidence. |
| `skill:organization-design` | `skill:flow` | Organization design depends on how work, decisions, and handoffs move between roles. |
| `skill:outcome-storytelling` | `skill:documentation` | Outcome stories require a clear written chain from evidence to impact. |
| `skill:parallel-execution-tuning` | `skill:background-processing` | Parallel tuning builds on understanding independently scheduled background work. |
| `skill:percentile-analysis` | `skill:statistical-reasoning` | Percentiles are statistical summaries of a distribution. |
| `skill:performance-coaching` | `skill:user-guidance` | Coaching builds on giving clear, contextual, and actionable guidance. |
| `skill:pipeline-maintenance` | `skill:background-processing` | Pipelines are recurring background processes whose execution and failures must be managed. |
| `skill:pipeline-orchestration` | `skill:background-processing` | Orchestration coordinates multiple deferred jobs, dependencies, and retries. |
| `skill:platform-investment-planning` | `skill:requirement` | Platform investment should trace back to explicit capabilities and constraints. |
| `skill:policy-lifecycle-management` | `skill:documentation` | Policies must first be explicit, versioned, and reviewable documents. |
| `skill:postmortem-facilitation` | `talent:root-cause-analysis` | A postmortem uses root-cause reasoning to turn incident evidence into learning. |
| `skill:privilege-escalation-mapping` | `skill:access-control` | Privilege paths are defined by identities, permissions, and access boundaries. |
| `skill:product-strategy` | `talent:user-research` | Product strategy begins with evidence about users and their unmet needs. |
| `skill:product-usability-validation` | `talent:user-research` | Usability validation requires evidence from representative users and tasks. |
| `skill:production-release-coordination` | `skill:version-control` | Coordinating a release requires a shared, identifiable version of the change set. |
| `skill:prompt-design` | `skill:requirement` | A useful prompt starts from a precise goal, constraints, and expected output. |
| `skill:prototyping-strategy` | `talent:wireframing` | Prototype strategy builds on representing flows and interfaces at low fidelity. |
| `skill:quality-standard-enforcement` | `skill:test-case` | Quality standards become enforceable through explicit, repeatable checks. |
| `skill:query-tuning` | `skill:data-querying` | Query tuning requires understanding query behavior before optimizing its execution. |
| `skill:reconnaissance` | `skill:tcp-ip` | Technical reconnaissance relies on basic network addressing, services, and connectivity. |
| `skill:recurring-issue-analysis` | `talent:root-cause-analysis` | Recurring issue analysis searches repeated symptoms for a shared underlying cause. |
| `skill:regulatory-alignment` | `skill:requirement` | Regulatory alignment translates external obligations into explicit requirements. |
| `skill:release-automation` | `skill:version-control` | Release automation needs a versioned source state as its reproducible input. |
| `skill:release-readiness-review` | `skill:smoke-test` | Readiness review needs a basic confirmation that critical paths work in the release candidate. |
| `skill:release-support` | `skill:ticket-handling` | Release support depends on capturing, prioritizing, and routing user-reported problems. |
| `skill:reliability-budgeting` | `skill:statistical-reasoning` | Reliability budgets depend on measured rates, windows, and acceptable variation. |
| `skill:remediation-guidance` | `skill:user-guidance` | Remediation guidance translates a finding into clear, safe corrective actions. |
| `skill:remediation-prioritization` | `skill:alert-triage` | Remediation prioritization applies the same urgency and impact triage used for alerts. |
| `skill:replication-management` | `skill:backup-recovery` | Replication management builds on preserving and recovering consistent copies of data. |
| `skill:report-lifecycle-management` | `skill:dashboard-reading` | Managing reports requires understanding their consumers, signals, and interpretation. |
| `skill:research-synthesis` | `talent:user-research` | Synthesis organizes raw user-research evidence into patterns and findings. |
| `skill:resilience-planning` | `skill:backup-recovery` | Resilience planning starts with how service and data recover after failure. |
| `skill:resource-coordination` | `skill:flow` | Resource coordination follows the sequence, ownership, and timing of work. |
| `skill:retrieval-design` | `skill:data-querying` | Retrieval design builds on selecting relevant information from a data source. |
| `skill:risk-mitigation-planning` | `skill:requirement` | Mitigations must preserve required outcomes while addressing explicit risks. |
| `skill:risk-register-maintenance` | `skill:documentation` | A risk register is structured, continuously maintained risk documentation. |
| `skill:roadmap-tradeoff-analysis` | `skill:requirement` | Roadmap tradeoffs are evaluated against product requirements and constraints. |
| `skill:runbook-execution` | `skill:documentation` | Runbook execution begins with accurately interpreting documented steps, checks, and expected outcomes. |
| `skill:saturation-point-reporting` | `skill:statistical-reasoning` | Saturation reporting interprets measured load, throughput, and response distributions. |
| `skill:schema-evolution-handling` | `skill:data-modeling` | Schema evolution requires understanding entities, fields, constraints, and compatibility. |
| `skill:scope-change-control` | `skill:requirement` | Scope changes can only be controlled against an agreed requirement baseline. |
| `skill:secrets-exposure-reduction` | `skill:access-control` | Reducing secret exposure depends on restricting who and what can access credentials. |
| `skill:secure-coding-review` | `skill:version-control` | Secure review operates on identifiable code changes and their history. |
| `skill:security-program-prioritization` | `skill:threat-detection` | Security priorities should be grounded in credible threats and observed exposure. |
| `skill:security-requirement-definition` | `skill:requirement` | Security requirements specialize general requirement definition with protection constraints. |
| `skill:security-strategy` | `skill:threat-detection` | Security strategy needs a foundation in the threats the organization must address. |
| `skill:selector-strategy` | `skill:semantic-markup` | Robust selectors depend on stable, meaningful document structure. |
| `skill:self-service-analytics-enablement` | `skill:dashboard-reading` | Enabling self-service starts with helping users interpret analytics outputs correctly. |
| `skill:semantic-model-governance` | `skill:data-modeling` | Semantic governance depends on shared definitions for entities and relationships. |
| `skill:session-state-design` | `skill:data-modeling` | Session state design requires modeling identity, lifecycle, and stored state transitions. |
| `skill:sprint-scope-negotiation` | `talent:agile-scrum` | Sprint scope negotiation builds on iterative planning and a bounded team commitment. |
| `skill:stakeholder-alignment` | `skill:requirement` | Alignment starts from a shared understanding of goals, needs, and constraints. |
| `skill:status-escalation` | `skill:escalation-handling` | Status escalation directly applies escalation thresholds, context, and routing. |
| `skill:stress-scenario-design` | `skill:test-case` | A stress scenario is a test case with explicit load, duration, and expected behavior. |
| `skill:system-hardening` | `skill:patch-management` | Patching known vulnerabilities is a foundational system-hardening practice. |
| `skill:task-analysis` | `talent:user-research` | Task analysis should be grounded in how users actually pursue goals and complete work. |
| `skill:team-health-diagnosis` | `talent:agile-scrum` | Team-health diagnosis builds on observing delivery cadence, collaboration, and impediments. |
| `skill:technical-mentoring` | `skill:user-guidance` | Mentoring depends on explaining technical work through actionable, audience-aware guidance. |
| `skill:technical-risk-portfolio-management` | `skill:requirement` | Technical risks must be evaluated against required outcomes and constraints. |
| `skill:technology-strategy` | `skill:requirement` | Technology strategy should derive choices from business and system requirements. |
| `skill:test-data-seeding` | `skill:data-modeling` | Seed data must respect the entities, relationships, and constraints under test. |
| `skill:threat-modeling` | `skill:threat-detection` | Threat modeling begins with recognizing threat actors, behaviors, and attack signals. |
| `skill:toil-reduction` | `skill:flow` | Reducing toil starts by mapping repetitive steps and handoffs in the current flow. |
| `skill:tool-use-orchestration` | `skill:flow` | Tool orchestration requires sequencing actions, decisions, and outputs across a workflow. |
| `skill:transactional-workflow-design` | `skill:data-modeling` | Transactional workflows depend on modeled state, consistency boundaries, and transitions. |
| `skill:usability-testing` | `talent:user-research` | Usability testing is a focused user-research method using representative tasks. |
| `skill:validation-strategy` | `skill:test-case` | A validation strategy is built from explicit cases, evidence, and expected outcomes. |
| `skill:vulnerability-chaining` | `skill:threat-detection` | Chaining vulnerabilities requires understanding how separate weaknesses form a threat path. |
| `skill:vulnerability-scanning` | `skill:threat-detection` | Scanning operationalizes detection of known vulnerability signals across assets. |
| `skill:warehouse-modeling` | `skill:data-modeling` | Warehouse models specialize core entity, relationship, and grain decisions. |
| `skill:workaround-documentation` | `skill:documentation` | A reusable workaround needs precise steps, limits, and verification notes. |
| `skill:workload-modeling` | `skill:statistical-reasoning` | Workload models summarize request distributions, rates, and variation. |
