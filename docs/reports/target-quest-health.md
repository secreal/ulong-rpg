# Target Quest Health Report

**Status:** WARNING

## Summary

| Kind | Targets | Quests | Fundamental | Dependent | Unique sources |
|---|---:|---:|---:|---:|---:|
| skill | 197 | 1970 | 39 | 158 | 59 |
| equipment | 189 | 1890 | 63 | 126 | 32 |
| talent | 165 | 1650 | 20 | 145 | 27 |
| **Total** | **551** | **5510** | **122** | **429** | **103** |

Errors: **0**  
Warnings: **16**

## Findings

### Warnings

- **source-concentration** at `data/target-quests/equipment`: One source URL is reused by 10 of 189 equipment targets. Details: {"labels":["Atlassian Team Playbook"],"share":0.0529,"targetCount":10,"url":"https://www.atlassian.com/team-playbook"}
- **source-concentration** at `data/target-quests/equipment`: One source URL is reused by 11 of 189 equipment targets. Details: {"labels":["Cloudflare Learning Center - Networking"],"share":0.0582,"targetCount":11,"url":"https://www.cloudflare.com/learning/network-layer/what-is-a-network/"}
- **source-concentration** at `data/target-quests/equipment`: One source URL is reused by 12 of 189 equipment targets. Details: {"labels":["Visual Studio Code Docs"],"share":0.0635,"targetCount":12,"url":"https://code.visualstudio.com/docs"}
- **source-concentration** at `data/target-quests/equipment`: One source URL is reused by 15 of 189 equipment targets. Details: {"labels":["PostgreSQL Tutorial"],"share":0.0794,"targetCount":15,"url":"https://www.postgresql.org/docs/current/tutorial.html"}
- **source-concentration** at `data/target-quests/equipment`: One source URL is reused by 16 of 189 equipment targets. Details: {"labels":["Microsoft Learn - Power BI","Microsoft Power BI Learn"],"share":0.0847,"targetCount":16,"url":"https://learn.microsoft.com/en-us/power-bi/"}
- **source-concentration** at `data/target-quests/equipment`: One source URL is reused by 19 of 189 equipment targets. Details: {"labels":["Docker Docs - Get Started"],"share":0.1005,"targetCount":19,"url":"https://docs.docker.com/get-started/"}
- **source-concentration** at `data/target-quests/equipment`: One source URL is reused by 20 of 189 equipment targets. Details: {"labels":["OWASP Cheat Sheet Series"],"share":0.1058,"targetCount":20,"url":"https://cheatsheetseries.owasp.org/"}
- **source-concentration** at `data/target-quests/equipment`: One source URL is reused by 22 of 189 equipment targets. Details: {"labels":["Microsoft Learn - Troubleshooting"],"share":0.1164,"targetCount":22,"url":"https://learn.microsoft.com/en-us/troubleshoot/"}
- **source-concentration** at `data/target-quests/skill`: One source URL is reused by 13 of 197 skill targets. Details: {"labels":["Material Design"],"share":0.066,"targetCount":13,"url":"https://m3.material.io/"}
- **source-concentration** at `data/target-quests/skill`: One source URL is reused by 80 of 197 skill targets. Details: {"labels":["freeCodeCamp - Problem Solving"],"share":0.4061,"targetCount":80,"url":"https://www.freecodecamp.org/news/problem-solving/"}
- **source-concentration** at `data/target-quests/talent`: One source URL is reused by 11 of 165 talent targets. Details: {"labels":["Android Developers - App Basics"],"share":0.0667,"targetCount":11,"url":"https://developer.android.com/guide"}
- **source-concentration** at `data/target-quests/talent`: One source URL is reused by 12 of 165 talent targets. Details: {"labels":["OWASP Cheat Sheet Series"],"share":0.0727,"targetCount":12,"url":"https://cheatsheetseries.owasp.org/"}
- **source-concentration** at `data/target-quests/talent`: One source URL is reused by 16 of 165 talent targets. Details: {"labels":["SQLBolt","SQLBolt - Interactive SQL Lessons"],"share":0.097,"targetCount":16,"url":"https://sqlbolt.com/"}
- **source-concentration** at `data/target-quests/talent`: One source URL is reused by 18 of 165 talent targets. Details: {"labels":["Google SRE Book"],"share":0.1091,"targetCount":18,"url":"https://sre.google/sre-book/table-of-contents/"}
- **source-concentration** at `data/target-quests/talent`: One source URL is reused by 25 of 165 talent targets. Details: {"labels":["MDN Web Docs"],"share":0.1515,"targetCount":25,"url":"https://developer.mozilla.org/en-US/docs/Learn_web_development"}
- **source-concentration** at `data/target-quests/talent`: One source URL is reused by 43 of 165 talent targets. Details: {"labels":["Microsoft API Design"],"share":0.2606,"targetCount":43,"url":"https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design"}

## Refresh

```powershell
node scripts/report-target-quest-health.mjs --format markdown --output docs/reports/target-quest-health.md
```
