# Talent Dependency Review

Every dependent talent has one reviewed direct prerequisite. Rationales identify the smallest credible conceptual or operational foundation represented by that edge.

| Target | Prerequisite targets | Semantic rationale |
| --- | --- | --- |
| `talent:agent-workflows` | `talent:prompt-engineering` | Reliable agent loops build on the ability to specify model instructions, context, and tool use. |
| `talent:android-jetpack` | `talent:kotlin` | Jetpack's Android APIs and architecture patterns are primarily learned through Kotlin application code. |
| `talent:angular` | `talent:typescript` | Modern Angular uses TypeScript for components, dependency injection, routing, and application structure. |
| `talent:angularjs` | `talent:javascript` | AngularJS applications are written around JavaScript controllers, services, scopes, and browser behavior. |
| `talent:ansible` | `talent:linux-administration` | Ansible automates the server configuration and operational tasks introduced by Linux administration. |
| `talent:apache-airflow` | `talent:python` | Airflow DAGs and operators are primarily authored and extended in Python. |
| `talent:apache-spark` | `skill:data-modeling` | Distributed Spark work depends first on understanding how data is structured, transformed, and related. |
| `talent:architecture-governance` | `talent:technology-strategy` | Architecture governance applies an established technology direction through standards and major-decision review. |
| `talent:aspnet-core` | `talent:dotnet` | ASP.NET Core is a web framework within the .NET platform. |
| `talent:aspnet-mvc` | `talent:dotnet` | ASP.NET MVC relies on the .NET runtime, libraries, project model, and language ecosystem. |
| `talent:aspnet-web-forms` | `talent:dotnet` | Web Forms is a legacy web application model within the .NET platform. |
| `talent:astro` | `talent:html-css` | Astro's content-first pages begin with web document structure and styling. |
| `talent:aws` | `skill:tcp-ip` | Operating AWS services credibly requires basic addressing, ports, routing, and network troubleshooting. |
| `talent:azure` | `skill:tcp-ip` | Azure compute and managed services depend on basic network addressing, routing, and connectivity concepts. |
| `talent:backbone` | `talent:javascript` | Backbone models, collections, views, and events are JavaScript application constructs. |
| `talent:bgp` | `skill:routing` | BGP extends foundational routing concepts to route exchange between autonomous networks. |
| `talent:bootstrap` | `talent:html-css` | Bootstrap composes responsive HTML structures with a predefined CSS component and utility system. |
| `talent:bower` | `talent:javascript` | Bower manages packages in the legacy JavaScript frontend ecosystem. |
| `talent:cakephp` | `talent:php` | CakePHP applications are implemented with PHP and its request, object, and package conventions. |
| `talent:classic-asp` | `talent:windows-server` | Classic ASP is hosted and administered through the Windows and IIS server environment. |
| `talent:cobol` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for maintaining COBOL programs. |
| `talent:codeigniter` | `talent:php` | CodeIgniter is a PHP framework whose controllers, models, and application code require PHP. |
| `talent:coffeescript` | `talent:javascript` | CoffeeScript compiles to JavaScript, so its runtime behavior and ecosystem require JavaScript concepts. |
| `talent:cordova` | `talent:javascript` | Cordova wraps JavaScript-driven web applications in native mobile containers. |
| `talent:data-warehousing` | `skill:data-modeling` | Warehouses organize facts, dimensions, relationships, and reporting structures through data modeling. |
| `talent:dbt` | `talent:sql` | dbt transformations, tests, and analytical models are authored primarily in SQL. |
| `talent:deep-learning` | `talent:machine-learning` | Deep learning specializes machine-learning workflows with neural representations and training methods. |
| `talent:delphi` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for maintaining Delphi applications. |
| `talent:design-systems` | `skill:color-system-design` | Reusable design systems build on systematic tokens and rules, with color systems as a concrete foundational model. |
| `talent:django` | `talent:python` | Django applications, models, views, and management commands are implemented in Python. |
| `talent:docker` | `talent:linux-administration` | Containers rely on Linux process, filesystem, permissions, networking, and service concepts. |
| `talent:dojo` | `talent:javascript` | Dojo widgets, modules, and application behavior are built with JavaScript. |
| `talent:dotnet` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining .NET software. |
| `talent:drupal` | `talent:php` | Drupal modules, themes, hooks, and backend customization use PHP. |
| `talent:edr` | `skill:threat-detection` | EDR investigation starts with recognizing suspicious endpoint signals and threat behavior. |
| `talent:ejb` | `talent:java` | Enterprise JavaBeans use Java types, annotations, packaging, and runtime conventions. |
| `talent:ember` | `talent:javascript` | Ember applications rely on JavaScript modules, objects, events, and browser execution. |
| `talent:engineering-management` | `talent:agile-scrum` | Engineering management builds on understanding iterative delivery, planning, feedback, and team execution. |
| `talent:etl-elt` | `talent:sql` | ETL and ELT pipelines rely on SQL to select, validate, join, and transform structured data. |
| `talent:express` | `talent:nodejs` | Express runs on Node.js and uses its server, module, request, and asynchronous execution model. |
| `talent:extjs` | `talent:javascript` | Ext JS components, stores, and application logic are JavaScript constructs. |
| `talent:fastapi` | `talent:python` | FastAPI services are defined with Python types, functions, modules, and asynchronous code. |
| `talent:flask` | `talent:python` | Flask routes, request handling, extensions, and application code are written in Python. |
| `talent:flutter` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining Flutter applications. |
| `talent:fuelphp` | `talent:php` | FuelPHP applications depend on PHP syntax, objects, packages, and runtime behavior. |
| `talent:gcp` | `skill:tcp-ip` | Operating GCP services credibly requires basic addressing, routing, ports, and connectivity concepts. |
| `talent:go` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining Go software. |
| `talent:graphql` | `skill:api-design` | GraphQL schemas and operations build on API contract, boundary, and client-integration design. |
| `talent:grpc` | `skill:api-design` | gRPC services require clear operation, message, compatibility, and integration contracts. |
| `talent:grunt` | `talent:javascript` | Grunt tasks and plugin configuration are part of the JavaScript build ecosystem. |
| `talent:gulp` | `talent:javascript` | Gulp pipelines are JavaScript programs composed from streams, tasks, and plugins. |
| `talent:hyper-v` | `talent:windows-server` | Hyper-V administration builds on Windows Server roles, services, storage, and host operations. |
| `talent:incident-response` | `skill:alert-triage` | Incident response begins by assessing alerts, evidence, severity, ownership, and immediate impact. |
| `talent:ionic` | `talent:javascript` | Ionic applications use JavaScript web application behavior inside a mobile UI and runtime. |
| `talent:iso-27001` | `talent:requirements-analysis` | ISO 27001 work starts by translating organizational needs and obligations into scoped control requirements. |
| `talent:java` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining Java software. |
| `talent:joomla` | `talent:php` | Joomla extensions, templates, and backend behavior are implemented in PHP. |
| `talent:jquery` | `talent:javascript` | jQuery is a JavaScript library for DOM, events, AJAX, and browser behavior. |
| `talent:jsf` | `talent:java` | JSF applications use Java classes, server-side components, and the Java web runtime. |
| `talent:knockout` | `talent:javascript` | Knockout observables, bindings, and view models are JavaScript constructs. |
| `talent:kotlin` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining Kotlin software. |
| `talent:kubernetes` | `talent:docker` | Kubernetes orchestrates container images and workloads, so container packaging and runtime concepts come first. |
| `talent:laminas` | `talent:php` | Laminas components and applications are implemented within the PHP language and package ecosystem. |
| `talent:laravel` | `talent:php` | Laravel applications use PHP for routing, models, services, queues, and framework extension. |
| `talent:llm-evaluation` | `talent:manual-testing` | LLM evaluation starts with explicit test cases, expected behavior, evidence, and repeatable human judgment. |
| `talent:machine-learning` | `skill:statistical-reasoning` | Predictive modeling requires basic reasoning about distributions, variation, evaluation, and uncertainty. |
| `talent:mongodb` | `skill:data-modeling` | MongoDB use depends on shaping documents, relationships, access patterns, and persistence boundaries. |
| `talent:mootools` | `talent:javascript` | MooTools extends JavaScript objects, DOM behavior, events, and browser interactions. |
| `talent:mpls` | `skill:routing` | MPLS forwarding and WAN paths build on understanding routes, next hops, and network topology. |
| `talent:mysql` | `talent:sql` | MySQL querying and relational data work use SQL as the direct language foundation. |
| `talent:nestjs` | `talent:typescript` | NestJS modules, decorators, services, and controllers are designed around TypeScript. |
| `talent:nextjs` | `talent:react` | Next.js extends React with routing, rendering, data loading, and production application conventions. |
| `talent:nist-csf` | `talent:requirements-analysis` | Applying the NIST CSF starts by clarifying organizational outcomes, constraints, and control needs. |
| `talent:nodejs` | `talent:javascript` | Node.js executes JavaScript outside the browser and retains its language and module foundations. |
| `talent:nuxt` | `talent:vue` | Nuxt extends Vue with routing, rendering, data loading, and fullstack application conventions. |
| `talent:objective-c` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for maintaining Objective-C applications. |
| `talent:observability` | `talent:application-monitoring` | Observability extends basic application health monitoring into correlated metrics, logs, traces, and impact analysis. |
| `talent:oracle-database` | `talent:sql` | Oracle relational querying and data operations use SQL as their direct language foundation. |
| `talent:ospf` | `skill:routing` | OSPF automates route discovery inside a network and therefore requires routing fundamentals. |
| `talent:pandas` | `talent:python` | pandas data frames, transformations, and analysis are expressed through Python code. |
| `talent:penetration-testing` | `skill:threat-detection` | Penetration testing requires recognizing threat behaviors and the security signals an attack path should produce. |
| `talent:performance-testing` | `talent:manual-testing` | Performance testing builds on defining test conditions, expected results, evidence, and reproducible checks. |
| `talent:perl` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for maintaining Perl scripts and applications. |
| `talent:phalcon` | `talent:php` | Phalcon applications use PHP language constructs even though framework internals are delivered as an extension. |
| `talent:phonegap` | `talent:javascript` | PhoneGap packages JavaScript-driven web applications for mobile devices. |
| `talent:php` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining PHP software. |
| `talent:playwright-testing` | `talent:test-automation` | Playwright applies established test-automation structure to browser interactions and end-to-end assertions. |
| `talent:plsql` | `talent:sql` | PL/SQL extends SQL with procedural database logic, packages, triggers, and control flow. |
| `talent:postgresql` | `talent:sql` | PostgreSQL querying, schema work, and relational operations use SQL directly. |
| `talent:power-bi-modeling` | `skill:data-modeling` | Power BI semantic models depend on relationships, grain, measures, and data-model structure. |
| `talent:privacy-compliance` | `talent:requirements-analysis` | Privacy compliance starts by translating legal and stakeholder obligations into explicit data-handling requirements. |
| `talent:product-discovery` | `talent:user-research` | Product discovery needs evidence about user behavior, pain points, and context before shaping opportunities. |
| `talent:prompt-engineering` | `talent:requirements-analysis` | Reliable prompts begin with clear goals, constraints, inputs, and acceptance expectations. |
| `talent:prototype-js` | `talent:javascript` | Prototype extends JavaScript objects, browser APIs, and event behavior. |
| `talent:prototyping` | `talent:wireframing` | Interactive prototypes elaborate the screen structure and flow first established in wireframes. |
| `talent:python` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining Python software. |
| `talent:pytorch` | `talent:deep-learning` | PyTorch implements neural-network modeling and training workflows introduced by deep learning. |
| `talent:rag` | `skill:data-querying` | RAG begins with retrieving the right source data before a model can ground its response. |
| `talent:react` | `talent:javascript` | React components, state, events, and rendering behavior are built with JavaScript. |
| `talent:react-native` | `talent:react` | React Native applies React components, state, and composition to native mobile interfaces. |
| `talent:redis` | `skill:data-modeling` | Redis use starts by choosing appropriate structures, keys, relationships, and access patterns. |
| `talent:requirejs` | `talent:javascript` | RequireJS organizes JavaScript modules and their runtime dependencies. |
| `talent:roadmapping` | `talent:requirements-analysis` | A roadmap can sequence outcomes only after needs, constraints, and acceptance boundaries are understood. |
| `talent:ruby-on-rails` | `skill:api-design` | Rails web applications need clear request, resource, response, and integration boundaries. |
| `talent:rust` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining Rust software. |
| `talent:scikit-learn` | `talent:machine-learning` | scikit-learn implements the preprocessing, training, validation, and evaluation workflow of classical machine learning. |
| `talent:sd-wan` | `skill:routing` | SD-WAN policy and overlays depend on understanding routes, paths, and network reachability. |
| `talent:secure-code-review` | `talent:web-security` | Reviewing application code for vulnerabilities requires understanding common web attack classes and protections. |
| `talent:security-strategy` | `talent:requirements-analysis` | Security strategy starts by clarifying business obligations, risk constraints, priorities, and desired outcomes. |
| `talent:selenium-testing` | `talent:test-automation` | Selenium applies established test-automation structure to browser actions and regression assertions. |
| `talent:siem` | `skill:log-analysis` | SIEM investigation depends on reading, filtering, correlating, and interpreting log evidence. |
| `talent:sinatra` | `skill:api-design` | Sinatra services need clear routes, request handling, response behavior, and integration contracts. |
| `talent:slim` | `talent:php` | Slim routes, middleware, and services are implemented in PHP. |
| `talent:soap` | `skill:api-design` | SOAP services require explicit operation, message, schema, compatibility, and integration contracts. |
| `talent:soc-2` | `talent:requirements-analysis` | SOC 2 readiness starts by translating trust criteria and customer expectations into scoped control requirements. |
| `talent:spring-boot` | `talent:java` | Spring Boot services use Java types, annotations, build conventions, and runtime behavior. |
| `talent:struts` | `talent:java` | Struts actions, configuration, and enterprise web code rely on Java. |
| `talent:svelte` | `talent:javascript` | Svelte components combine markup with JavaScript state, events, and reactive behavior. |
| `talent:swift` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for building and maintaining Swift software. |
| `talent:swiftui` | `talent:swift` | SwiftUI views, state, modifiers, and application code are expressed in Swift. |
| `talent:symfony` | `talent:php` | Symfony components, services, controllers, and applications are implemented in PHP. |
| `talent:tableau-dashboarding` | `skill:dashboard-reading` | Building useful Tableau dashboards begins with understanding dashboard signals, filters, and interpretation. |
| `talent:tailwind-css` | `talent:html-css` | Tailwind utilities compose CSS styling directly onto HTML structures. |
| `talent:tcp-ip` | `skill:tcp-ip` | The talent-level networking practice is rooted in the fundamental TCP/IP addressing and transport skill. |
| `talent:technical-mentoring` | `skill:documentation` | Effective mentoring depends on explaining knowledge clearly and leaving guidance others can revisit. |
| `talent:technology-strategy` | `talent:requirements-analysis` | Technology strategy begins by clarifying business needs, constraints, risks, and desired outcomes. |
| `talent:tensorflow` | `talent:deep-learning` | TensorFlow implements neural-network modeling, training, and deployment workflows introduced by deep learning. |
| `talent:terraform` | `skill:server-administration` | Infrastructure as code builds on understanding the servers, services, and operational resources being declared. |
| `talent:test-automation` | `talent:manual-testing` | Automation should encode test cases, expected behavior, evidence, and failure interpretation already understood manually. |
| `talent:threat-modeling` | `talent:requirements-analysis` | Threat modeling starts by understanding system goals, actors, data flows, constraints, and intended behavior. |
| `talent:tsql` | `talent:sql` | T-SQL extends SQL with Microsoft-specific procedural logic, jobs, and database operations. |
| `talent:vb6` | `skill:version-control` | A controlled source-history workflow is the smallest operational foundation for maintaining Visual Basic 6 applications. |
| `talent:vbnet` | `talent:dotnet` | VB.NET uses the .NET runtime, libraries, project model, and tooling. |
| `talent:vite` | `talent:javascript` | Vite serves and bundles modern JavaScript modules and frontend applications. |
| `talent:vmware` | `skill:server-administration` | Virtualization management builds on server resources, operating systems, storage, services, and host operations. |
| `talent:vue` | `talent:javascript` | Vue components, reactivity, events, and application behavior are built with JavaScript. |
| `talent:vulnerability-management` | `skill:patch-management` | Vulnerability management turns identified weaknesses into prioritized remediation and patch work. |
| `talent:wcf` | `talent:dotnet` | WCF is a .NET communication framework and relies on its runtime, types, configuration, and service model. |
| `talent:web-security` | `talent:rest-api` | Web security builds on HTTP request, response, authentication, resource, and integration behavior. |
| `talent:webpack` | `talent:javascript` | Webpack compiles and packages JavaScript modules and their frontend assets. |
| `talent:wordpress` | `talent:php` | WordPress themes, plugins, hooks, and backend behavior are implemented in PHP. |
| `talent:xamarin` | `talent:dotnet` | Xamarin builds mobile applications on the .NET runtime, libraries, and project ecosystem. |
| `talent:yii` | `talent:php` | Yii applications use PHP for controllers, models, components, and framework extension. |
| `talent:yui` | `talent:javascript` | YUI modules, widgets, events, and browser behavior are built with JavaScript. |
| `talent:zend-framework` | `talent:php` | Zend Framework components and applications are implemented in PHP. |

