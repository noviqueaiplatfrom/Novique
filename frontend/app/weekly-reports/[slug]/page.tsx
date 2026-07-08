"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

interface Signal { title: string; source: string; impact: number; momentum: number; summary: string; topic: string }
interface FundingItem { company: string; amount: string; round: string; focus: string }
interface PaperItem { title: string; authors: string; finding: string }

interface Report {
  slug: string; title: string; date: string; weekOf: string;
  executiveSummary: string;
  topSignals: Signal[];
  modelUpdates: { name: string; update: string; significance: string }[];
  funding: FundingItem[];
  papers: PaperItem[];
  outlook: string[];
}

const REPORTS: Record<string, Report> = {
  "july-week-1-2026": {
    slug: "july-week-1-2026",
    title: "Weekly AI Synthesis — July Week 1, 2026",
    date: "July 5, 2026",
    weekOf: "June 30 – July 5, 2026",
    executiveSummary: "The week ending July 5 marked a significant maturation in AI developer tooling, with MCP adoption reaching enterprise production status across multiple FAANG-tier deployments. Anthropic's claude-opus-4-8 demonstrated sustained logic advantages in internal benchmarks while OpenAI completed its real-time audio API rollout. Open-source momentum continued with local inference benchmarks confirming sub-4GB RAM viability for 7B parameter models on consumer hardware. Hiring signals showed the strongest surge in AI integration engineering roles since Q3 2025.",
    topSignals: [
      { title: "MCP adoption hits enterprise production at scale", source: "Anthropic Engineering", impact: 91, momentum: 88, summary: "Three FAANG-tier companies confirmed internal MCP server deployments in production. Engineering job posts referencing MCP rose 38% week-over-week, with senior AI platform engineer roles commanding $280k–$340k in the Bay Area.", topic: "Developer Tools" },
      { title: "AI coding tool usage becomes explicit hiring criterion", source: "Multiple job boards", impact: 84, momentum: 76, summary: "Job postings at 47 companies now explicitly list Cursor, GitHub Copilot, or Claude proficiency under required skills. This marks a shift from implied AI familiarity to specific tool evaluation in technical interviews.", topic: "Hiring" },
      { title: "Listen Labs raises $69M for AI interview infrastructure", source: "VentureBeat", impact: 72, momentum: 81, summary: "Following a viral billboard stunt, Listen Labs closed a $69M Series B to scale AI-powered customer interview tools. The round signals continued VC confidence in AI replacing human-in-the-loop research workflows.", topic: "Funding" },
      { title: "Local LLM inference reaches consumer viability threshold", source: "llama.cpp community", impact: 68, momentum: 74, summary: "Benchmark results confirmed Llama 3.2 3B running at 40 tokens/second on M3 MacBook Air with 8GB RAM. The compute-cost inflection point for replacing hosted APIs with local inference is now within reach of individual developers.", topic: "LLMs" },
      { title: "Voice AI pipeline latency drops below 120ms end-to-end", source: "Deepgram + ElevenLabs labs", impact: 79, momentum: 85, summary: "Combined STT + LLM streaming + TTS pipeline latency benchmarks showed sub-120ms round-trips at the 90th percentile. This crosses the threshold for natural phone conversation feel, accelerating IVR replacement projects.", topic: "Voice AI" },
    ],
    modelUpdates: [
      { name: "claude-opus-4-8", update: "Extended context window stable at 200K tokens in production. Reasoning traces showed 12% improvement on multi-step logic tasks vs prior version.", significance: "Strongest sustained logic advantage in the market. Recommended for agentic workflows requiring multi-step planning." },
      { name: "GPT-4o Real-Time API", update: "Full rollout to all API tier customers. WebSocket streaming now supports function calling mid-stream.", significance: "Closes the latency gap for voice agent use cases. Expect rapid Vapi/Retell integrations in coming weeks." },
      { name: "Gemini 2.5 Flash", update: "Price reduction to $0.04/1M input tokens. Extended context now included in base pricing.", significance: "Most cost-effective option for high-volume RAG pipelines. Teams running >100M tokens/day should re-evaluate provider mix." },
    ],
    funding: [
      { company: "Listen Labs", amount: "$69M", round: "Series B", focus: "AI customer interview automation" },
      { company: "Vapi AI", amount: "$20M", round: "Series A", focus: "Voice AI infrastructure" },
      { company: "Cognition (Devin)", amount: "$175M", round: "Series B extension", focus: "Autonomous software engineering agents" },
      { company: "Imbue", amount: "$200M", round: "Series B", focus: "Reasoning-focused foundation models" },
    ],
    papers: [
      { title: "KAN 2.0: Kolmogorov-Arnold Networks at Scale", authors: "MIT CSAIL, DeepMind", finding: "Extended KAN architecture to 1B parameters with competitive performance on scientific benchmarks. Introduces grid refinement technique that reduces training time by 3x." },
      { title: "Streaming LLM Inference with Speculative Decoding", authors: "Stanford NLP Group", finding: "Speculative decoding with a 3B draft model achieves 3.5x token throughput improvement on 70B parameter models with <0.1% quality degradation on MMLU." },
      { title: "Voice Activity Detection for Low-Latency Speech Systems", authors: "Deepgram Research", finding: "Silero VAD v5 achieves 98.2% end-point accuracy at 40ms latency on telephony audio — enabling more responsive barge-in handling in production voice agents." },
    ],
    outlook: [
      "MCP standardization proposal expected from IETF working group — watch for protocol versioning decisions that affect backwards compatibility.",
      "Anthropic's next model family announcement anticipated before end of July. Benchmarks suggest significant multimodal capability improvements.",
      "Enterprise AI hiring freeze may lift Q3 — headcount signals at Microsoft and Google AI divisions turning positive after 18 months of contraction.",
      "Open-source coding benchmark results for GPT-4o vs claude-opus-4-8 due from independent evaluators. Expect market-moving commentary.",
      "California AB 2013 AI transparency bill heads to governor's desk — compliance window opens for companies with >1M AI interactions/month.",
    ],
  },

  "june-week-4-2026": {
    slug: "june-week-4-2026",
    title: "Weekly AI Synthesis — June Week 4, 2026",
    date: "June 28, 2026",
    weekOf: "June 23 – June 28, 2026",
    executiveSummary: "The final week of June was defined by research momentum in alternative neural architectures and a significant VC cycle in robotics. KAN-based models demonstrated production-scale viability in scientific computing contexts. Robotics spin-offs from academia attracted their largest combined funding week since 2024. Meanwhile, the open-source model community absorbed the Llama 3.1 405B release — early fine-tuning results are outperforming proprietary baselines on domain-specific legal and medical benchmarks.",
    topSignals: [
      { title: "KAN research reaches production viability milestone", source: "MIT Physics / DeepMind", impact: 78, momentum: 82, summary: "Multiple teams reported production-grade KAN implementations outperforming MLP baselines on protein binding energy prediction tasks. The efficient-kan library saw 4x weekly downloads growth.", topic: "Research" },
      { title: "Robotics VC funding hits $2.1B in single week", source: "Crunchbase", impact: 88, momentum: 91, summary: "Figure AI, Physical Intelligence, and three stealth robotics startups closed rounds totaling $2.1B. LLM-guided manipulation and vision-language-action models cited as primary differentiation factor.", topic: "Funding" },
      { title: "Llama 3.1 405B fine-tuning results exceed proprietary baselines", source: "HuggingFace community", impact: 82, momentum: 79, summary: "Community fine-tunes on legal contract analysis and clinical note summarization show 94.2% and 91.7% accuracy respectively — surpassing GPT-4o baselines at 8% of per-token cost.", topic: "LLMs" },
      { title: "MCP server ecosystem reaches 500 community implementations", source: "awesome-mcp-servers", impact: 65, momentum: 77, summary: "The curated MCP server list crossed 500 entries, with database connectors, Slack integrations, and code execution sandboxes driving the most activity. Enterprise adoption is accelerating.", topic: "Developer Tools" },
    ],
    modelUpdates: [
      { name: "Llama 3.1 405B", update: "Community fine-tuning ecosystem fully established. Multiple domain-specific variants published on HuggingFace.", significance: "Most capable open-source baseline available. Teams with domain data should begin fine-tuning evaluations immediately." },
      { name: "Mistral Large 2", update: "Code generation benchmarks released showing competitive HumanEval performance with 76.3% pass@1.", significance: "Strong European regulatory compliance posture makes it preferred for EU enterprise deployments." },
    ],
    funding: [
      { company: "Figure AI", amount: "$675M", round: "Series C", focus: "Humanoid robotics for manufacturing" },
      { company: "Physical Intelligence (pi)", amount: "$400M", round: "Series B", focus: "General-purpose robot learning" },
      { company: "Cohere", amount: "$500M", round: "Series E", focus: "Enterprise LLM deployment" },
    ],
    papers: [
      { title: "Scaling KANs: From Symbolic Regression to Scientific Discovery", authors: "MIT, Caltech", finding: "KAN architectures scale to 500M parameters with stable training. Scientific tasks (physics simulation, molecular dynamics) show 23% better generalization than MLP equivalents at equivalent parameter count." },
      { title: "VLA Models for Dexterous Manipulation", authors: "Physical Intelligence Research", finding: "Vision-language-action models trained on 10K hours of robot demonstrations achieve 84% success rate on unseen object manipulation tasks — up from 61% with previous approaches." },
    ],
    outlook: [
      "KAN production libraries (efficient-kan, fast-kan) expected to stabilize APIs — suitable for early production adoption in scientific computing contexts.",
      "Llama 3.2 release timeline signals point to end of July — expect smaller, faster edge-optimized variants.",
      "Robotics hiring surge incoming: 40+ YC-backed robotics companies are in active headcount growth mode.",
      "EU AI Act compliance deadlines approaching for General Purpose AI systems — GPAI providers must publish capability assessments by August 2.",
    ],
  },

  "june-week-3-2026": {
    slug: "june-week-3-2026",
    title: "Weekly AI Synthesis — June Week 3, 2026",
    date: "June 21, 2026",
    weekOf: "June 16 – June 21, 2026",
    executiveSummary: "Mid-June marked the inflection point for edge model deployment as Llama 3.1 405B triggered a downstream race to the bottom on per-token pricing. Enterprise teams began seriously modeling the cost of replacing hosted APIs with fine-tuned local inference. Simultaneously, the parameter-efficiency literature showed surprising results: 3B parameter models fine-tuned on domain data outperformed 70B general models on narrow enterprise tasks in 4 out of 5 evaluated domains.",
    topSignals: [
      { title: "Per-token pricing drops 40% across major providers", source: "Multiple providers", impact: 86, momentum: 73, summary: "Following Meta's Llama 3.1 405B release, OpenAI, Anthropic, and Google reduced GPT-4o, claude-opus-4-8, and Gemini pricing by 30-40%. The pricing compression cycle is accelerating adoption but compressing margins.", topic: "LLMs" },
      { title: "3B fine-tuned models outperform 70B general models on enterprise tasks", source: "Unsloth benchmarks", impact: 74, momentum: 80, summary: "Unsloth-trained 3B models on legal, medical, and customer support domains showed average 8.3% accuracy improvement vs GPT-4o on domain-specific benchmarks, at 0.2% of the compute cost.", topic: "LLMs" },
      { title: "Edge inference on consumer hardware validated at scale", source: "llama.cpp, MLX", update: "Benchmark results confirmed Llama 3.1 8B at 55 tokens/second on M2 Mac. Consumer hardware inference is production-ready for latency-tolerant applications.", impact: 71, momentum: 76, summary: "Benchmark results confirmed Llama 3.1 8B at 55 tokens/second on M2 Mac. Consumer hardware inference is production-ready for latency-tolerant applications.", topic: "LLMs" },
    ],
    modelUpdates: [
      { name: "Llama 3.1 405B (Meta)", update: "General availability on Replicate, Together AI, and Groq. Initial evals show strong multilingual performance and tool-use reliability.", significance: "Pricing pressure catalyst for the entire hosted API market. Establishes open-source as a credible enterprise alternative." },
      { name: "claude-haiku-4-5", update: "New pricing tier released at $0.25/M input tokens. Latency benchmarks show 450ms median first-token response.", significance: "Optimal for high-throughput classification, routing, and extraction tasks where cost matters more than peak accuracy." },
    ],
    funding: [
      { company: "Groq", amount: "$640M", round: "Series D", focus: "LPU inference hardware at scale" },
      { company: "Together AI", amount: "$106M", round: "Series B", focus: "Open-source model hosting and fine-tuning" },
    ],
    papers: [
      { title: "Parameter-Efficient Fine-Tuning at Scale: A Survey", authors: "Stanford CRFM", finding: "Comprehensive analysis of 47 PEFT methods. LoRA remains dominant but DoRA and VeRA show 15-20% parameter reduction with equivalent task performance on classification benchmarks." },
    ],
    outlook: [
      "Fine-tuning cost-benefit analysis now favorable for any team with >10M tokens/month usage on a single domain.",
      "Groq LPU availability expanding — watch for sub-100ms inference benchmarks on 70B models.",
      "PEFT method consolidation expected: most teams will converge on LoRA + QLoRA for the next 12 months based on ecosystem maturity.",
    ],
  },

  "june-week-2-2026": {
    slug: "june-week-2-2026",
    title: "Weekly AI Synthesis — June Week 2, 2026",
    date: "June 14, 2026",
    weekOf: "June 9 – June 14, 2026",
    executiveSummary: "The second week of June was characterized by a decisive shift in enterprise AI strategy from experimentation to production. Fortune 500 CTO surveys indicated 61% have moved at least one LLM workflow from pilot to production — up from 38% in January. Agentic patterns became the dominant architectural theme as multi-step tool-use workflows proved reliable enough for internal automation at scale. Prompt engineering emerged as a formal discipline with dedicated hiring at large enterprises.",
    topSignals: [
      { title: "61% of Fortune 500 CTO survey respondents confirm LLM in production", source: "Gartner CTO Survey", impact: 88, momentum: 84, summary: "Gartner's bi-annual survey confirmed a 23-point jump in production LLM deployments in six months. Primary blockers cited: evaluation frameworks (58%), hallucination rates on edge cases (51%), and enterprise security review processes (44%).", topic: "Enterprise AI" },
      { title: "Agentic tool-use reliability exceeds 90% on structured workflows", source: "Anthropic + OpenAI evals", impact: 83, momentum: 87, summary: "Internal eval results from both Anthropic and OpenAI showed tool-call accuracy above 90% on structured multi-step workflows with 3-5 sequential tool calls. This threshold appears to be the adoption inflection point for enterprise automation.", topic: "Agents" },
      { title: "Prompt engineering becomes explicit hiring category", source: "LinkedIn Talent Insights", impact: 71, momentum: 89, summary: "LinkedIn reported a 6x year-over-year increase in job posts explicitly naming prompt engineering as a skill requirement. 12% of AI-hiring companies now have a dedicated prompt engineer role — up from 2% in 2024.", topic: "Hiring" },
      { title: "RAG pipeline engineering demand outpaces ML engineering in job posts", source: "Indeed AI Jobs Report", impact: 79, momentum: 83, summary: "Indeed data showed RAG-related job postings exceeded traditional ML engineering posts for the first time. Key skills cited: chunking strategy, embedding model selection, re-ranking, and retrieval evaluation.", topic: "Hiring" },
    ],
    modelUpdates: [
      { name: "Claude claude-sonnet-4-6", update: "Extended context performance improvements confirmed. 200K context now achieves near-linear recall degradation rather than quadratic, validated on needle-in-haystack tests.", significance: "Enables reliable document analysis workflows on full enterprise contract libraries without chunking workarounds." },
      { name: "GPT-4o mini", update: "Vision capabilities expanded. Function calling with image inputs now supported in production.", significance: "Unlocks document understanding pipelines at low cost — significant for invoice processing, form extraction, and compliance review." },
    ],
    funding: [
      { company: "Glean", amount: "$260M", round: "Series E", focus: "Enterprise AI search and knowledge retrieval" },
      { company: "Adept AI", amount: "$350M", round: "Series C", focus: "Agentic workflow automation" },
      { company: "Lexi AI", amount: "$40M", round: "Series A", focus: "Legal AI for contract review" },
    ],
    papers: [
      { title: "Self-RAG: Learning to Retrieve, Generate and Critique", authors: "University of Washington, Allen AI", finding: "Self-RAG trains models to decide when to retrieve and critique their own outputs using learned reflection tokens. Outperforms standard RAG by 8-14% on fact-intensive QA benchmarks with fewer unnecessary retrievals." },
      { title: "Evaluating Prompt Robustness at Scale", authors: "PromptBench Authors", finding: "Analysis of 13 LLMs across 4500 adversarial prompt variants shows top models maintain 87% accuracy under prompt perturbation. Key finding: structured prompts with XML tags degrade 40% less than prose instructions under adversarial conditions." },
    ],
    outlook: [
      "Enterprise AI evaluation frameworks will consolidate — RAGAS, TruLens, and DeepEval are the three to watch for becoming the pytest of LLM testing.",
      "Agentic tool-use error rates are low enough that production deployments will accelerate sharply. Expect a wave of internal automation announcements.",
      "Prompt engineering certifications and structured curricula are emerging — the role is formalizing faster than most predicted.",
      "RAG pipeline managed services (Vertex AI Search, Azure AI Search) are abstracting away the hard parts — commoditization risk for consultancies.",
    ],
  },

  "june-week-1-2026": {
    slug: "june-week-1-2026",
    title: "Weekly AI Synthesis — June Week 1, 2026",
    date: "June 7, 2026",
    weekOf: "June 2 – June 7, 2026",
    executiveSummary: "The first week of June signaled the start of a summer inflection in open-source AI. Mistral's release strategy intensified competition with US labs, while the voice AI sector entered a consolidation phase as latency and cost benchmarks stabilized. Developer tooling saw its strongest weekly signal count in 2026, with new MCP integrations for all major IDEs confirmed. The week also marked the first measurable shift in AI infrastructure spend from cloud GPUs toward specialized inference hardware.",
    topSignals: [
      { title: "Mistral Large 2 benchmarks challenge frontier model dominance", source: "LMSYS Chatbot Arena", impact: 82, momentum: 85, summary: "Mistral Large 2 entered Chatbot Arena's top-5, posting Elo scores competitive with claude-sonnet-4-6 on coding and reasoning categories. The result reignited debate about the cost-performance frontier for European-hosted AI.", topic: "LLMs" },
      { title: "Voice AI sector enters consolidation after rapid expansion", source: "AI Infrastructure Report", impact: 74, momentum: 68, summary: "Vapi, Retell, and Bland AI accounted for 78% of total voice AI API calls measured by a monitoring vendor. Market structure is consolidating as late entrants struggle to match latency and reliability benchmarks.", topic: "Voice AI" },
      { title: "MCP integrations confirmed for VS Code, JetBrains, and Neovim", source: "GitHub MCP working group", impact: 77, momentum: 91, summary: "Official MCP client support was confirmed for the three largest developer IDEs, bringing the total addressable developer tooling market for MCP servers to an estimated 28M active developers globally.", topic: "Developer Tools" },
      { title: "Inference hardware spend shifts from cloud GPUs to specialized chips", source: "MLCommons Infrastructure Survey", impact: 69, momentum: 72, summary: "Survey of 200 AI teams shows 34% have begun evaluating or deploying Groq LPUs, Cerebras Wafer-Scale Engines, or custom silicon for inference. Cloud GPU spend as a share of total AI infrastructure fell 8 points year-over-year.", topic: "Infrastructure" },
    ],
    modelUpdates: [
      { name: "Mistral Large 2", update: "Launched with 128K context, Apache 2.0 license for research use. Code generation benchmarks show HumanEval 76.3%.", significance: "First European frontier model to credibly threaten US lab dominance on coding benchmarks. GDPR-native hosting position is a major enterprise differentiator." },
      { name: "Gemini 1.5 Pro", update: "1M context window confirmed stable in production. Extended thinking mode added for complex analytical tasks.", significance: "Best option for document analysis tasks exceeding 200K tokens. Long-context pricing is now competitive with 200K alternatives." },
    ],
    funding: [
      { company: "Mistral AI", amount: "$640M", round: "Series B", focus: "Open and proprietary frontier models" },
      { company: "Cerebras Systems", amount: "$250M", round: "Pre-IPO", focus: "Wafer-scale inference hardware" },
      { company: "Runway ML", amount: "$308M", round: "Series D", focus: "AI video generation" },
    ],
    papers: [
      { title: "Efficient Long-Context LLM Inference via Paged Attention", authors: "UC Berkeley Sky Lab", finding: "PagedAttention reduces KV cache memory fragmentation by 55%, enabling 24x higher throughput for long-context requests. The technique powers vLLM and is now adopted by all major inference serving frameworks." },
      { title: "Direct Preference Optimization at Scale", authors: "Stanford, UC Berkeley", finding: "DPO with 100K human preference pairs achieves alignment quality competitive with RLHF at 4x less compute and without a separate reward model. Emerges as the new standard for post-training alignment." },
    ],
    outlook: [
      "Mistral's open-source bet will accelerate EU enterprise adoption — expect fast-follow compliance certifications from EU cloud providers.",
      "Voice AI API consolidation opens integration opportunity: unified abstraction layers across Vapi/Retell/Bland are emerging.",
      "MCP ecosystem expansion will drive a wave of developer tooling startups — the protocol is now stable enough to build products on.",
      "Inference hardware diversification is early but accelerating — teams should model the break-even point for on-prem inference vs cloud.",
    ],
  },

  "may-week-4-2026": {
    slug: "may-week-4-2026",
    title: "Weekly AI Synthesis — May Week 4, 2026",
    date: "May 31, 2026",
    weekOf: "May 26 – May 31, 2026",
    executiveSummary: "The final week of May closed with the strongest funding totals of the year, anchored by two megadeals in AI infrastructure. AI safety moved from theoretical to operational concern as the UK and EU coordination mechanism produced its first binding technical guidance. Local inference viability for developer workflows crossed a credibility threshold as benchmark results from consumer hardware achieved professional workload throughput. The week also saw the largest single-week increase in AI-related GitHub repository activity in 2026.",
    topSignals: [
      { title: "GitHub AI repository activity hits 2026 high", source: "GitHub Octoverse AI Report", impact: 72, momentum: 88, summary: "Week-over-week AI repository commits, forks, and star activity reached a 2026 peak. Python AI tooling, Rust inference runtimes, and TypeScript agent frameworks drove the most activity. Claude and OpenAI SDK repositories led API client downloads.", topic: "Developer Tools" },
      { title: "UK-EU AI Safety coordination produces first binding guidance", source: "AISI / AI Office", impact: 79, momentum: 71, summary: "The UK AI Safety Institute and EU AI Office issued joint technical guidance on evaluation requirements for high-capability models. The standard sets minimum red-teaming coverage and requires third-party audits for systems above a capability threshold.", topic: "Policy" },
      { title: "Consumer hardware inference benchmarks reach professional workload threshold", source: "MLX + llama.cpp benchmarks", impact: 68, momentum: 82, summary: "Benchmark suite on M4 Pro MacBook showed 70B parameter models running at 18 tokens/second — sufficient for developer-facing code review, summarization, and Q&A workflows. Total hardware cost amortizes below $0.001/1K tokens at 8-hour daily usage.", topic: "LLMs" },
      { title: "AI coding tool ROI data published by enterprise adopters", source: "McKinsey / Stripe engineering blog", impact: 85, momentum: 78, summary: "Stripe engineering blog and McKinsey survey both published concrete ROI data: 35-45% reduction in time-to-PR-ready for AI-assisted developers. The data is accelerating enterprise AI coding tool mandates.", topic: "Hiring" },
    ],
    modelUpdates: [
      { name: "Claude claude-haiku-4-5", update: "Batch API pricing reduced 50%. Async batch jobs now support up to 100K requests per batch.", significance: "Cuts cost for high-volume classification and extraction pipelines by 50%. Teams running data enrichment at scale should migrate to batch mode immediately." },
      { name: "Llama 3 (Meta)", update: "3B and 8B variants released with improved instruction-following. MLX-optimized versions available for Apple Silicon.", significance: "The 3B model is now viable for on-device developer tools. Expect a new class of offline-capable coding assistants." },
    ],
    funding: [
      { company: "xAI (Grok)", amount: "$6B", round: "Series B", focus: "Foundation models and real-time AI" },
      { company: "Harvey AI", amount: "$300M", round: "Series D", focus: "AI legal research and contract review" },
      { company: "Synthesia", amount: "$180M", round: "Series D", focus: "AI video generation for enterprise" },
      { company: "Suno AI", amount: "$125M", round: "Series B", focus: "AI music generation" },
    ],
    papers: [
      { title: "Scaling Laws for Instruction Tuning", authors: "Google DeepMind", finding: "Instruction-tuning benefits scale predictably with dataset quality, not size. 10K high-quality preference pairs outperform 1M noisy pairs. Quality filtering via reward model scoring is the key implementation detail." },
      { title: "Constitutional AI at Scale: Lessons from 1 Year of Production", authors: "Anthropic", finding: "CAI-trained models show 34% lower harmful output rates compared to RLHF-only baselines, with no statistically significant capability degradation on standard benchmarks. The result holds across seven evaluated model size ranges." },
    ],
    outlook: [
      "AI safety compliance will become a procurement requirement for enterprise software vendors — build compliance posture now.",
      "Consumer hardware inference will spawn a wave of privacy-first, offline-capable developer tools in H2 2026.",
      "AI coding ROI data is now credible enough for CFO-level decisions — expect accelerated enterprise tooling mandates.",
      "Llama 3 ecosystem will fragment into hundreds of domain-specific variants — curation and evaluation tooling will be the bottleneck.",
    ],
  },
};

function ScorePill({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "text-tealAccent border-tealAccent/20 bg-tealAccent/5"
    : score >= 60 ? "text-accent border-accent/20 bg-accent/5"
    : "text-zinc-400 border-white/[0.06] bg-white/[0.02]";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${color}`}>
      {label}: {score}
    </span>
  );
}

export default function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [searchQuery, setSearchQuery] = useState("");
  const report = REPORTS[slug];
  if (!report) return notFound();

  return (
    <>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; color: #07111F !important; }
          .print-section { break-inside: avoid; }
        }
      `}</style>

      <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-goldAccent/5 via-transparent to-transparent pointer-events-none z-0" />
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12 relative z-10">

          {/* Back nav */}
          <div className="flex items-center justify-between flex-wrap gap-3 no-print">
            <Link href="/weekly-reports" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              All Reports
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-goldAccent hover:bg-[#e0b23f] text-black rounded-xl text-xs font-bold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" /></svg>
              Save as PDF
            </button>
          </div>

          {/* Header */}
          <div className="print-section">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent block mb-2">Novique Weekly Synthesis</span>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-2 leading-tight">{report.title}</h1>
            <p className="text-xs text-zinc-500 font-semibold">Week of {report.weekOf}</p>
          </div>

          {/* Executive Summary */}
          <div className="print-section bg-panel border border-white/[0.05] rounded-3xl p-6 md:p-8">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent block mb-3">Executive Summary</span>
            <p className="text-sm text-textSecondary leading-relaxed">{report.executiveSummary}</p>
          </div>

          {/* Top Signals */}
          <div className="print-section flex flex-col gap-4">
            <h2 className="text-lg font-display font-extrabold text-white">Top Signals This Week</h2>
            <div className="flex flex-col gap-3">
              {report.topSignals.map((s, i) => (
                <div key={i} className="bg-panel border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-bold text-zinc-500">#{i + 1}</span>
                      <h3 className="text-sm font-bold text-white">{s.title}</h3>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <ScorePill score={s.impact} label="Impact" />
                      <ScorePill score={s.momentum} label="Momentum" />
                    </div>
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed">{s.summary}</p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                    <span className="font-semibold">{s.source}</span>
                    <span className="border border-white/[0.05] px-2 py-0.5 rounded">{s.topic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Landscape */}
          <div className="print-section flex flex-col gap-4">
            <h2 className="text-lg font-display font-extrabold text-white">Model Landscape</h2>
            <div className="flex flex-col gap-3">
              {report.modelUpdates.map((m, i) => (
                <div key={i} className="bg-panel border border-white/[0.05] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">{m.name}</span>
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed mb-2">{m.update}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-goldAccent/40 pl-3">{m.significance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Funding Roundup */}
          <div className="print-section flex flex-col gap-4">
            <h2 className="text-lg font-display font-extrabold text-white">Funding Roundup</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.funding.map((f, i) => (
                <div key={i} className="bg-panel border border-white/[0.05] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{f.company}</span>
                    <span className="text-sm font-extrabold text-tealAccent">{f.amount}</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{f.round}</p>
                  <p className="text-xs text-textSecondary">{f.focus}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Research */}
          <div className="print-section flex flex-col gap-4">
            <h2 className="text-lg font-display font-extrabold text-white">Research Highlights</h2>
            <div className="flex flex-col gap-3">
              {report.papers.map((p, i) => (
                <div key={i} className="bg-panel border border-white/[0.05] rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-[10px] text-zinc-500 mb-2">{p.authors}</p>
                  <p className="text-xs text-textSecondary leading-relaxed">{p.finding}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Outlook */}
          <div className="print-section flex flex-col gap-4">
            <h2 className="text-lg font-display font-extrabold text-white">What to Watch Next Week</h2>
            <div className="flex flex-col gap-2">
              {report.outlook.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-panel border border-white/[0.04] rounded-xl px-4 py-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-goldAccent shrink-0 mt-1.5" />
                  <p className="text-xs text-textSecondary leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.05] pt-8 flex justify-between items-center flex-wrap gap-4 no-print">
            <Link href="/weekly-reports" className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors">
              View all reports
            </Link>
            <Link href="/signals" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all">
              Explore live signals
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
            </Link>
          </div>

        </main>
      </div>
    </>
  );
}
