"use client";

import { use, useState, useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

interface Resource { label: string; url: string; description: string; tag: string }
interface Concept { title: string; body: string }
interface Question { q: string; options: string[]; answer: number }
interface Lesson {
  slug: string; type: string; title: string; tagline: string;
  signal: string; signalDelta: string; time: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  impact: string; adopters: string[]; overview: string; whyNow: string;
  concepts: Concept[]; codeTitle: string; codeLang: string; code: string;
  resources: Resource[]; questionBank: Question[];
}

const LESSONS: Record<string, Lesson> = {
  "mcp-server-development": {
    slug: "mcp-server-development", type: "Skill",
    title: "MCP Server Development",
    tagline: "Build context-aware AI integrations using Anthropic's open protocol",
    signal: "Mentions in job postings for AI integration engineers spiked 38% this week.",
    signalDelta: "+38%", time: "20 minutes", difficulty: "Intermediate",
    impact: "High", adopters: ["Anthropic", "OpenAI", "Microsoft"],
    overview: "Model Context Protocol (MCP) is an open standard developed by Anthropic that defines how AI applications communicate with external data sources, tools, and services. Instead of writing custom integrations for every AI app, you build one MCP server and any MCP-compatible client (Cursor, Claude Desktop, VS Code Copilot) can use it automatically.",
    whyNow: "Every major AI IDE now ships MCP support out of the box. Enterprise teams are standardizing their internal tool exposure on MCP rather than building per-client adapters. Engineers who can build and maintain MCP servers are being hired specifically for this skill — it shows up in senior AI engineer and AI platform roles at companies ranging from startups to FAANG.",
    concepts: [
      { title: "Servers, Clients, and Hosts", body: "An MCP server exposes capabilities (tools, resources, prompts). An MCP client is the AI app (Claude Desktop, Cursor). The host is the process that manages the client lifecycle. Your job as a developer is to write the server." },
      { title: "Three Primitives", body: "Tools are functions the model can call (read_file, query_db). Resources are data the model can read (file contents, API responses). Prompts are reusable message templates. Most servers expose tools — that's what makes agents actually do things." },
      { title: "Transport: stdio vs HTTP", body: "Local servers use stdio transport — your server is a subprocess the client launches. Remote servers use HTTP with Server-Sent Events. Start with stdio for local dev; migrate to HTTP when you need to share the server across a team or deploy it." },
    ],
    codeTitle: "Your first MCP tool server (TypeScript)",
    codeLang: "typescript",
    code: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";

const server = new McpServer({ name: "file-reader", version: "1.0.0" });

// Expose a tool the model can call
server.tool(
  "read_file",
  "Read a file from the local filesystem",
  { path: z.string().describe("Absolute path to the file") },
  async ({ path }) => {
    const content = await fs.readFile(path, "utf-8");
    return { content: [{ type: "text", text: content }] };
  }
);

// Connect via stdio (works with Claude Desktop + Cursor)
const transport = new StdioServerTransport();
await server.connect(transport);`,
    resources: [
      { label: "Official MCP Docs", url: "https://modelcontextprotocol.io/introduction", description: "Full protocol spec and quickstart guides", tag: "Docs" },
      { label: "MCP TypeScript SDK", url: "https://github.com/modelcontextprotocol/typescript-sdk", description: "The official SDK used in the example above", tag: "GitHub" },
      { label: "Awesome MCP Servers", url: "https://github.com/punkpeye/awesome-mcp-servers", description: "Community list of production MCP servers to study", tag: "GitHub" },
      { label: "Claude Desktop Config", url: "https://modelcontextprotocol.io/quickstart/user", description: "Wire your server into Claude Desktop in 5 minutes", tag: "Guide" },
    ],
    questionBank: [
      { q: "What does MCP stand for?", options: ["Model Context Protocol", "Multi-Channel Processing", "Model Composition Pipeline", "Machine Context Provider"], answer: 0 },
      { q: "Which company developed the MCP open standard?", options: ["OpenAI", "Google DeepMind", "Anthropic", "Microsoft"], answer: 2 },
      { q: "What are the three core primitives exposed by an MCP server?", options: ["Agents, Actions, Artifacts", "Tools, Resources, Prompts", "Servers, Clients, Hosts", "APIs, SDKs, CLIs"], answer: 1 },
      { q: "Which transport type does a local MCP server use?", options: ["HTTP/REST", "gRPC", "stdio", "WebSocket"], answer: 2 },
      { q: "What makes a Tool different from a Resource in MCP?", options: ["Tools require authentication; Resources do not", "Tools are callable functions; Resources are data the model reads", "Tools work remotely; Resources work locally", "There is no difference"], answer: 1 },
      { q: "In the code example, what does `server.tool()` expose?", options: ["A streaming audio interface", "A function to read local files", "A database query runner", "A reusable prompt template"], answer: 1 },
      { q: "When should you migrate from stdio to HTTP transport?", options: ["When using TypeScript instead of Python", "When the server exposes more than 10 tools", "When you need to share the server across a team or deploy it", "When using Claude Desktop"], answer: 2 },
      { q: "What is the role of an MCP Resource?", options: ["Execute code on behalf of the model", "Provide data the model can read", "Define conversation turn structure", "Manage API rate limits"], answer: 1 },
      { q: "Which of these AI clients natively supports MCP?", options: ["GPT-4o Playground", "Gemini Advanced", "Cursor", "Perplexity"], answer: 2 },
      { q: "What is the primary advantage of MCP over per-client custom integrations?", options: ["It automatically generates tests", "It reduces token usage", "One server works with any MCP-compatible client", "It provides built-in authentication"], answer: 2 },
      { q: "What is an MCP Host?", options: ["The cloud provider running the server", "The process that manages the MCP client lifecycle", "The AI model itself", "The authentication service"], answer: 1 },
      { q: "In stdio transport, how is the MCP server process started?", options: ["It registers itself with a discovery service", "The user launches it manually before the IDE", "The client launches it as a subprocess", "It runs as a system daemon"], answer: 2 },
      { q: "What is the purpose of a Prompt primitive in MCP?", options: ["Inject system instructions at runtime", "Reusable, parameterized message templates", "Control the model's temperature", "Define the server's name and version"], answer: 1 },
      { q: "What does Zod provide in the TypeScript MCP code example?", options: ["HTTP request handling", "Schema validation for tool input parameters", "File system access", "Connection pooling"], answer: 1 },
      { q: "Which official MCP SDK is used in the lesson's code example?", options: ["@anthropic-ai/sdk", "@modelcontextprotocol/sdk", "@openai/mcp", "mcp-server-core"], answer: 1 },
      { q: "What type of data can an MCP Resource expose?", options: ["Only local files", "Only database rows", "File contents, API responses, and any readable data source", "Only JSON objects"], answer: 2 },
      { q: "Which scenario best justifies switching from stdio to HTTP transport?", options: ["The tool has a large input schema", "Multiple engineers on different machines need to use the same server", "The LLM is making too many tool calls", "The server is written in Python instead of TypeScript"], answer: 1 },
      { q: "What happens when an MCP client cannot find a registered tool the model requested?", options: ["The model retries with a different tool name", "The client returns a tool-not-found error to the model", "The server auto-generates the tool", "The session is terminated"], answer: 1 },
      { q: "From a developer's perspective, what is the key responsibility when building an MCP integration?", options: ["Writing the client application", "Writing the MCP server that exposes your data/tools", "Configuring the AI model parameters", "Setting up the host process"], answer: 1 },
      { q: "What does `server.connect(transport)` do in the MCP code example?", options: ["Sends a test ping to the client", "Starts listening for client requests over the specified transport", "Registers the server with a discovery API", "Validates all tool schemas"], answer: 1 },
    ],
  },

  "local-llm-fine-tuning-unsloth": {
    slug: "local-llm-fine-tuning-unsloth", type: "Technology",
    title: "Local LLM Fine-Tuning with Unsloth",
    tagline: "Train domain-specific models on consumer hardware at 2-5x speed",
    signal: "Unsloth training speedups reduce Llama 3 fine-tuning from 8h to under 2h on a single A100.",
    signalDelta: "5x faster", time: "45 minutes", difficulty: "Intermediate",
    impact: "Medium-High", adopters: ["Anysphere (Cursor)", "Replicate", "Together AI"],
    overview: "Unsloth is an open-source fine-tuning library that makes LoRA/QLoRA training 2-5x faster and uses 60% less VRAM than standard HuggingFace training. It achieves this through hand-written CUDA kernels and smart gradient checkpointing. You can fine-tune Llama 3, Mistral, Gemma, and Phi models on a single consumer GPU.",
    whyNow: "Hosted API costs are predictable, but fine-tuned local models can cut per-token cost to zero for high-volume use cases. Startups are building domain-specific models (legal, medical, code, customer support) and Unsloth makes this feasible without a cluster. Replicate and Together AI now host fine-tuned models natively — the path from training to deployment is straightforward.",
    concepts: [
      { title: "LoRA: Low-Rank Adaptation", body: "LoRA freezes the original model weights and injects small trainable matrices (rank r, typically 8-64) into the attention layers. Instead of training billions of parameters, you train millions. The original model stays intact — you're adding a lightweight adapter." },
      { title: "Quantization (4-bit / 8-bit)", body: "Quantization reduces weight precision from 32-bit float to 4-bit int. A 7B model drops from ~28GB to ~4GB VRAM. You lose a tiny amount of accuracy but gain the ability to run on consumer hardware. Unsloth uses bitsandbytes under the hood." },
      { title: "Dataset Format", body: "Unsloth expects instruction-following data in ShareGPT or Alpaca format: a system prompt, a user turn, and an assistant turn. You can prepare this from any Q&A dataset, support transcripts, or domain documents chunked into prompt-response pairs." },
    ],
    codeTitle: "Fine-tune Llama 3.2 with Unsloth (Python)",
    codeLang: "python",
    code: `from unsloth import FastLanguageModel
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset

# Load model with 4-bit quantization
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3.2-3b-instruct",
    max_seq_length=2048,
    load_in_4bit=True,
)

# Add LoRA adapters (trains ~1% of parameters)
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
)

dataset = load_dataset("json", data_files="your_data.jsonl", split="train")

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        max_steps=100,
        learning_rate=2e-4,
        output_dir="./outputs",
    ),
)

trainer.train()
model.save_pretrained("my-fine-tuned-model")`,
    resources: [
      { label: "Unsloth GitHub", url: "https://github.com/unslothai/unsloth", description: "Source code, benchmarks, and model support list", tag: "GitHub" },
      { label: "Unsloth Docs", url: "https://docs.unsloth.ai", description: "Installation, notebooks, and deployment guides", tag: "Docs" },
      { label: "HuggingFace PEFT", url: "https://huggingface.co/docs/peft", description: "Underlying LoRA/QLoRA adapter library", tag: "Docs" },
      { label: "Replicate Deployment", url: "https://replicate.com/docs/guides/fine-tune-a-language-model", description: "Deploy your fine-tuned model as a hosted API", tag: "Guide" },
    ],
    questionBank: [
      { q: "What does LoRA stand for?", options: ["Low-Rank Adaptation", "Large-Range Approximation", "Layer-Relative Optimization", "Low-Resource Architecture"], answer: 0 },
      { q: "What is the primary benefit of 4-bit quantization?", options: ["Faster internet bandwidth", "Dramatically reduced VRAM usage", "Higher model accuracy", "Smaller dataset requirements"], answer: 1 },
      { q: "In the code, what does `r=16` specify?", options: ["The learning rate multiplier", "The LoRA rank — size of the trainable adapter matrices", "The number of training epochs", "The quantization bit depth"], answer: 1 },
      { q: "Approximately what percentage of parameters does LoRA train?", options: ["50%", "25%", "10%", "~1%"], answer: 3 },
      { q: "Which dataset format does Unsloth primarily expect?", options: ["Raw plaintext paragraphs", "CSV with 'input' and 'output' columns", "ShareGPT or Alpaca instruction format", "HuggingFace Arrow binary format"], answer: 2 },
      { q: "How much faster is Unsloth compared to standard HuggingFace training?", options: ["1.2x", "2-5x", "10x", "50x"], answer: 1 },
      { q: "Which layers does LoRA inject adapter matrices into?", options: ["Normalization layers", "Embedding layers only", "Attention projection layers (q_proj, k_proj, etc.)", "Output classifier layers"], answer: 2 },
      { q: "What library does Unsloth use for quantization under the hood?", options: ["ONNX Runtime", "TensorRT", "bitsandbytes", "OpenVINO"], answer: 2 },
      { q: "What does `model.save_pretrained()` save in a LoRA setup?", options: ["The full model weights", "The LoRA adapter weights only", "The tokenizer only", "A compressed GGUF file"], answer: 1 },
      { q: "What is the key trade-off when using 4-bit quantization?", options: ["Training is slower but more accurate", "Slight accuracy reduction in exchange for much lower VRAM usage", "Model files are larger but inference is faster", "Requires proprietary Nvidia hardware"], answer: 1 },
      { q: "What does QLoRA combine?", options: ["LoRA adapters with knowledge distillation", "LoRA adapters with 4-bit quantization of the base model", "LoRA with full fine-tuning on the last layer", "Quantization with mixture-of-experts routing"], answer: 1 },
      { q: "What is the typical range for the LoRA rank `r`?", options: ["1-4", "8-64", "100-256", "512-1024"], answer: 1 },
      { q: "What does `gradient_accumulation_steps=4` effectively do?", options: ["Reduces learning rate by 4x", "Quadruples the effective batch size without using more VRAM", "Runs 4 separate training jobs in parallel", "Saves a checkpoint every 4 steps"], answer: 1 },
      { q: "What is `lora_alpha` in the LoRA configuration?", options: ["The dropout rate for adapter layers", "A scaling factor that controls the magnitude of adapter updates", "The number of attention heads to target", "The maximum sequence length"], answer: 1 },
      { q: "Which model families does Unsloth officially support?", options: ["Only Llama", "GPT-2 and BERT only", "Llama, Mistral, Gemma, and Phi", "Only models under 7B parameters"], answer: 2 },
      { q: "What does SFTTrainer stand for in the trl library?", options: ["Supervised Fine-Tuning Trainer", "Scaled Feature Training Runner", "Sequence Fidelity Tracker", "Shared Foundation Tuner"], answer: 0 },
      { q: "What does `load_in_4bit=True` enable in `from_pretrained()`?", options: ["4-bit gradient checkpointing", "4-bit quantization of the base model weights before loading", "4-bit tokenization", "4-bit positional encoding"], answer: 1 },
      { q: "Why does LoRA keep the original model weights frozen?", options: ["To prevent overfitting to the adapter", "To allow the same base model to serve multiple adapters and preserve pretrained knowledge", "Because frozen weights train faster", "Because HuggingFace requires it"], answer: 1 },
      { q: "How much VRAM reduction does Unsloth achieve compared to standard training?", options: ["~10%", "~30%", "~60%", "~90%"], answer: 2 },
      { q: "What is `target_modules` used for in `get_peft_model()`?", options: ["Specifying which layers to freeze completely", "Specifying which layers receive LoRA adapter matrices", "Listing the modules to exclude from quantization", "Defining the output format of the saved model"], answer: 1 },
    ],
  },

  "kolmogorov-arnold-networks": {
    slug: "kolmogorov-arnold-networks", type: "Research Paper Practice",
    title: "Kolmogorov-Arnold Networks (KANs)",
    tagline: "Interpretable architectures replacing MLPs in scientific computing",
    signal: "High performance-to-compute ratio in physics and biology models. Demand for production conversion engineers is rising.",
    signalDelta: "Emerging", time: "60 minutes", difficulty: "Advanced",
    impact: "High", adopters: ["MIT Physics Labs", "DeepMind Biological Research"],
    overview: "Kolmogorov-Arnold Networks replace the fixed activation functions in traditional MLPs (like ReLU or GELU on neurons) with learnable activation functions on the network's edges, implemented as B-splines. This makes networks smaller, more interpretable, and better suited to symbolic regression and physics-simulation tasks where you need to understand the learned function, not just approximate it.",
    whyNow: "The original KAN paper from MIT showed competitive accuracy with MLPs at a fraction of the parameter count for scientific tasks. DeepMind's biology teams are applying KANs to protein interaction models. For engineers, the opportunity is in converting research implementations into production-grade wrappers — the pykan library is research-quality but not production-ready.",
    concepts: [
      { title: "Learnable Activations on Edges", body: "Traditional MLPs place fixed activations on nodes (neurons). KANs place learnable B-spline functions on edges (weights). Each edge learns its own nonlinear transformation. This doubles the number of learnable components but each component is interpretable." },
      { title: "B-Splines", body: "B-splines are piecewise polynomial functions defined by control points (knots). The network learns the knot positions and weights. Critically, you can visualize and simplify the learned splines — a KAN can literally show you the mathematical function it learned." },
      { title: "When to Use KANs vs MLPs", body: "KANs outperform MLPs on low-dimensional scientific tasks where interpretability matters (physics equations, symbolic regression). MLPs are still better for high-dimensional perception tasks (vision, language). KANs are not a drop-in replacement — pick the architecture for the task type." },
    ],
    codeTitle: "KAN from scratch with pykan (Python)",
    codeLang: "python",
    code: `# pip install pykan
from kan import KAN
import torch

# KAN with architecture [2, 5, 1]: 2 inputs -> 5 hidden -> 1 output
model = KAN(width=[2, 5, 1], grid=5, k=3)

def target(x):
    return torch.exp(torch.sin(torch.pi * x[:, 0]) + x[:, 1] ** 2)

x_train = torch.rand(1000, 2) * 2 - 1
y_train = target(x_train)

dataset = {
    "train_input": x_train,
    "train_label": y_train,
    "test_input": x_train[:200],
    "test_label": y_train[:200],
}

# lamb controls regularization — prunes low-importance edges
results = model.train(dataset, opt="LBFGS", steps=50, lamb=0.001)

model.plot()
model.auto_symbolic()
print(model.symbolic_formula())`,
    resources: [
      { label: "KAN Paper (arXiv)", url: "https://arxiv.org/abs/2404.19756", description: "Original paper: KAN: Kolmogorov-Arnold Networks", tag: "Paper" },
      { label: "pykan GitHub", url: "https://github.com/KindXiaoming/pykan", description: "Reference implementation from the MIT team", tag: "GitHub" },
      { label: "efficient-kan", url: "https://github.com/Blealtan/efficient-kan", description: "Production-grade re-implementation, 10x faster than pykan", tag: "GitHub" },
      { label: "KAN 2.0 Paper", url: "https://arxiv.org/abs/2408.10205", description: "Updated architecture with improved scaling and expressivity", tag: "Paper" },
    ],
    questionBank: [
      { q: "What does KAN stand for?", options: ["Kernel Attention Network", "Kolmogorov-Arnold Networks", "Knowledge-Aware Nodes", "Keyframe Activation Network"], answer: 1 },
      { q: "Where does a KAN place its learnable activation functions, unlike an MLP?", options: ["On neurons (nodes)", "On edges (weights)", "On the input embedding", "On the loss function"], answer: 1 },
      { q: "What type of functions are used as learnable activations in KANs?", options: ["ReLU variants", "Fourier series", "B-splines", "Sigmoid curves"], answer: 2 },
      { q: "What are the control points in a B-spline called?", options: ["Anchors", "Nodes", "Knots", "Pivots"], answer: 2 },
      { q: "On which type of task do KANs typically outperform MLPs?", options: ["High-dimensional image classification", "Large-scale language modeling", "Low-dimensional scientific and symbolic regression tasks", "Video generation"], answer: 2 },
      { q: "What unique capability does a trained KAN have that MLPs lack?", options: ["It can process audio natively", "It can reveal the learned mathematical formula", "It trains without backpropagation", "It requires no GPU"], answer: 1 },
      { q: "In KAN(width=[2, 5, 1]), what do the three numbers represent?", options: ["Learning rate, steps, grid size", "Inputs, hidden nodes, outputs", "Grid points, spline order, rank", "Epochs, batch size, hidden layers"], answer: 1 },
      { q: "What does the `lamb` parameter control in `model.train()`?", options: ["Learning rate", "Regularization — prunes low-importance edges", "Spline grid resolution", "Number of training steps"], answer: 1 },
      { q: "What does `model.auto_symbolic()` attempt to do?", options: ["Convert the model to ONNX", "Recover an exact symbolic mathematical expression", "Prune all edges below a threshold", "Export spline weights to CSV"], answer: 1 },
      { q: "Where do MLPs still outperform KANs?", options: ["Physics simulations", "Symbolic regression", "High-dimensional perception tasks like vision and language", "Protein folding"], answer: 2 },
      { q: "What does the `grid` parameter in KAN() control?", options: ["Number of hidden layers", "Number of grid intervals for each B-spline function", "The learning rate schedule", "Number of output classes"], answer: 1 },
      { q: "What does `k=3` specify in the KAN constructor?", options: ["Number of training epochs", "The spline polynomial order (cubic)", "Number of hidden nodes", "Rank of weight matrices"], answer: 1 },
      { q: "Which optimizer is used in the code example?", options: ["Adam", "SGD with momentum", "LBFGS", "AdaGrad"], answer: 2 },
      { q: "What does `model.plot()` display in pykan?", options: ["A loss curve over training steps", "A visualization of the learned activation functions on each edge", "A confusion matrix", "A histogram of weight magnitudes"], answer: 1 },
      { q: "Which university lab published the original KAN paper?", options: ["Stanford AI Lab", "Berkeley AI Research", "MIT", "Carnegie Mellon"], answer: 2 },
      { q: "What is efficient-kan relative to pykan?", options: ["A smaller model with fewer parameters", "A faster, production-grade reimplementation of pykan", "A web interface for pykan", "A cloud-hosted version of KAN training"], answer: 1 },
      { q: "Why are KANs considered more interpretable than MLPs?", options: ["They have fewer parameters", "Each edge's activation function can be independently visualized and simplified to a formula", "They use integer arithmetic", "Their weights are always positive"], answer: 1 },
      { q: "What mathematical theorem underpins the KAN architecture?", options: ["Universal Approximation Theorem", "Kolmogorov-Arnold Representation Theorem", "Bayes Theorem", "Nyquist-Shannon Sampling Theorem"], answer: 1 },
      { q: "What is a key limitation of pykan compared to efficient-kan for production use?", options: ["pykan only works on CPU", "pykan is research-quality and significantly slower than efficient-kan", "pykan requires a paid license", "pykan does not support symbolic simplification"], answer: 1 },
      { q: "In the code, why is the training input range set to [-1, 1]?", options: ["B-splines require inputs in [-1, 1]", "The target function only has real values in that range", "It is a convention for numerical stability in spline fitting", "The LBFGS optimizer requires bounded inputs"], answer: 2 },
    ],
  },

  "voice-ai-agent-pipeline": {
    slug: "voice-ai-agent-pipeline", type: "Startup Integration",
    title: "Voice AI Agent Pipeline Engineering",
    tagline: "Build sub-200ms speech-to-speech agents that replace legacy IVR",
    signal: "Low-latency WebSocket voice bots are replacing legacy IVR telephone systems at scale.",
    signalDelta: "Very High", time: "30 minutes", difficulty: "Intermediate",
    impact: "Very High", adopters: ["Retell AI", "Vapi", "Bland AI"],
    overview: "A voice AI pipeline chains three real-time components: Speech-to-Text (STT) converts audio to text, an LLM generates a response, and Text-to-Speech (TTS) converts the response back to audio. The entire round-trip must complete in under 200ms to feel natural. This is done over WebSockets with streaming at each stage — you never wait for a full sentence before starting the next stage.",
    whyNow: "ElevenLabs, Deepgram, and AssemblyAI have driven STT/TTS latency to under 50ms each. Vapi and Retell provide hosted orchestration layers that handle WebSocket lifecycle, interruption detection, and turn-taking. Companies are replacing inbound call centers with voice agents that cost pennies per call.",
    concepts: [
      { title: "Streaming at Every Stage", body: "Never buffer a full sentence. Deepgram sends partial transcripts as the user speaks. The LLM streams token-by-token output. ElevenLabs begins synthesizing audio before it receives the full sentence. Each stage starts consuming the previous stage's output the moment the first chunk arrives." },
      { title: "Interruption Handling (Barge-in)", body: "When the user speaks mid-response, the pipeline must stop TTS playback, discard the LLM generation in progress, and process the new user input immediately. This requires tracking audio playback state and cancelling in-flight API requests — Vapi and Retell handle this for you; raw pipelines require careful state management." },
      { title: "Turn Detection", body: "Knowing when a user has finished speaking (end-point detection) is harder than it sounds. Too aggressive: cuts users off mid-sentence. Too conservative: awkward silence. Deepgram's endpointing uses VAD (Voice Activity Detection) plus a configurable silence threshold." },
    ],
    codeTitle: "Minimal voice pipeline with Deepgram + OpenAI + ElevenLabs",
    codeLang: "python",
    code: `import asyncio, websockets, json
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
from openai import AsyncOpenAI
from elevenlabs.client import ElevenLabs
from elevenlabs import stream as el_stream

dg = DeepgramClient()
oai = AsyncOpenAI()
el = ElevenLabs()

async def voice_pipeline(audio_stream):
    connection = dg.listen.asyncwebsocket.v("1")

    async def on_transcript(_, result, **__):
        text = result.channel.alternatives[0].transcript
        if result.is_final and text:
            await respond(text)

    async def respond(user_text: str):
        chunks = []
        async for chunk in await oai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful phone agent."},
                {"role": "user", "content": user_text},
            ],
            stream=True,
        ):
            chunks.append(chunk.choices[0].delta.content or "")

        audio = el.generate(
            text="".join(chunks),
            voice="Rachel",
            model="eleven_turbo_v2",  # lowest latency model
            stream=True,
        )
        el_stream(audio)

    connection.on(LiveTranscriptionEvents.Transcript, on_transcript)
    await connection.start(LiveOptions(model="nova-2", punctuate=True))

    async for chunk in audio_stream:
        await connection.send(chunk)`,
    resources: [
      { label: "Vapi Quickstart", url: "https://docs.vapi.ai/quickstart", description: "Hosted voice agent platform — zero infra to manage", tag: "Docs" },
      { label: "Retell AI Docs", url: "https://docs.retellai.com", description: "Alternative hosted platform with custom LLM support", tag: "Docs" },
      { label: "Deepgram Streaming STT", url: "https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio", description: "Low-latency real-time transcription API", tag: "Docs" },
      { label: "ElevenLabs Turbo v2", url: "https://elevenlabs.io/docs/api-reference/text-to-speech", description: "Sub-75ms TTS with streaming audio output", tag: "Docs" },
    ],
    questionBank: [
      { q: "What is the target round-trip latency for a natural voice conversation?", options: ["Under 1000ms", "Under 500ms", "Under 200ms", "Under 50ms"], answer: 2 },
      { q: "What are the three stages in a voice AI pipeline in order?", options: ["TTS -> LLM -> STT", "LLM -> STT -> TTS", "STT -> LLM -> TTS", "STT -> TTS -> LLM"], answer: 2 },
      { q: "What does VAD stand for?", options: ["Voice API Driver", "Variable Audio Delay", "Voice Activity Detection", "Virtual Agent Dispatcher"], answer: 2 },
      { q: "What is 'barge-in' in a voice pipeline?", options: ["The initial connection handshake", "When the user speaks while the bot is still responding", "A fallback when STT fails", "The bot's greeting message"], answer: 1 },
      { q: "What must happen immediately when barge-in is detected?", options: ["Restart the WebSocket connection", "Increase the TTS speed", "Stop TTS playback and cancel the in-flight LLM generation", "Switch to a different STT provider"], answer: 2 },
      { q: "What is the key principle of streaming in a voice pipeline?", options: ["Wait for a full sentence before starting the next stage", "Each stage starts processing the previous stage's first chunk immediately", "Buffer audio in 1-second windows", "Only stream TTS, not STT"], answer: 1 },
      { q: "Which ElevenLabs model is used in the code example for lowest latency?", options: ["eleven_monolingual_v1", "eleven_multilingual_v2", "eleven_turbo_v2", "eleven_flash_v3"], answer: 2 },
      { q: "What does end-point detection determine?", options: ["When the WebSocket connection drops", "When to switch LLM providers", "When the user has finished speaking", "When TTS audio is fully buffered"], answer: 2 },
      { q: "What is the consequence of too-aggressive end-point detection settings?", options: ["Higher latency", "The bot cuts users off mid-sentence", "TTS audio becomes choppy", "The LLM generates longer responses"], answer: 1 },
      { q: "What protocol is used to stream real-time audio between pipeline stages?", options: ["HTTP long-polling", "gRPC streaming", "WebSocket", "MQTT"], answer: 2 },
      { q: "What does `result.is_final` check in the Deepgram transcript handler?", options: ["Whether the audio stream has ended", "Whether the transcription result is a final (not partial) transcript", "Whether the LLM has finished generating", "Whether the user pressed a button"], answer: 1 },
      { q: "What is the approximate STT-only latency achievable with Deepgram nova-2?", options: ["500ms", "200ms", "Under 50ms", "Under 10ms"], answer: 2 },
      { q: "Why does the code collect LLM stream chunks into a list before calling ElevenLabs?", options: ["ElevenLabs requires the full text before generating audio", "WebSockets can't handle concurrent streams", "OpenAI requires it", "To reduce API costs"], answer: 0 },
      { q: "What is a primary advantage of using Vapi or Retell over building a raw pipeline?", options: ["They provide free LLM credits", "They handle WebSocket lifecycle, barge-in, and turn-taking automatically", "They have lower STT latency than Deepgram", "They work without an internet connection"], answer: 1 },
      { q: "What challenge is specific to phone (telephony) voice AI compared to browser-based?", options: ["Phone audio has lower quality, more noise, and narrower frequency range", "Phone calls cannot use WebSocket", "Phone microphones don't support streaming", "Phone audio cannot be transcribed by Deepgram"], answer: 0 },
      { q: "What does the silence threshold in VAD control?", options: ["How loud the user must speak to be detected", "How long to wait after the last detected speech before marking end-of-turn", "The minimum audio chunk size to send to STT", "The maximum recording duration"], answer: 1 },
      { q: "Which company provides the nova-2 STT model used in the code?", options: ["OpenAI", "AssemblyAI", "Deepgram", "ElevenLabs"], answer: 2 },
      { q: "What does `punctuate=True` do in `LiveOptions`?", options: ["Adds punctuation marks to the transcription output", "Enables speaker diarization", "Activates noise reduction", "Forces lowercase output"], answer: 0 },
      { q: "Why is buffering a full sentence before TTS harmful in a voice pipeline?", options: ["It increases token costs", "It adds hundreds of milliseconds of latency, making the conversation feel unnatural", "TTS models reject long inputs", "It prevents barge-in detection"], answer: 1 },
      { q: "What does `el_stream(audio)` do in the ElevenLabs integration?", options: ["Saves the audio to a file", "Plays the audio chunks in real-time as they stream from the API", "Encodes audio to base64", "Sends audio back to the user over WebSocket"], answer: 1 },
    ],
  },
};

const QUIZ_SIZE = 10;
const PASS_THRESHOLD = 0.8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCertId(slug: string) {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const prefix = slug.split("-").map((w) => w[0].toUpperCase()).join("").slice(0, 4);
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `NVQ-${ymd}-${prefix}-${rand}`;
}

const difficultyColor: Record<string, string> = {
  Beginner: "text-tealAccent border-tealAccent/30 bg-tealAccent/5",
  Intermediate: "text-accent border-accent/30 bg-accent/5",
  Advanced: "text-goldAccent border-goldAccent/30 bg-goldAccent/5",
};

const tagColor: Record<string, string> = {
  Docs: "bg-accent/10 text-accent border-accent/20",
  GitHub: "bg-tealAccent/10 text-tealAccent border-tealAccent/20",
  Guide: "bg-goldAccent/10 text-goldAccent border-goldAccent/20",
  Paper: "bg-purple-400/10 text-purple-400 border-purple-400/20",
};

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  // All hooks before any conditional returns
  const [searchQuery, setSearchQuery] = useState("");
  const [quizState, setQuizState] = useState<"idle" | "naming" | "active" | "done">("idle");
  const [learnerName, setLearnerName] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const certId = useRef("");

  const lesson = LESSONS[slug];
  if (!lesson) return notFound();

  const total = quizQuestions.length;
  const score = answers.filter((a, i) => a === quizQuestions[i]?.answer).length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= PASS_THRESHOLD * 100;
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  function beginQuiz() {
    const selected = shuffle(lesson.questionBank).slice(0, QUIZ_SIZE);
    setQuizQuestions(selected);
    setAnswers([]);
    setCurrentQ(0);
    setSelected(null);
    certId.current = makeCertId(slug);
    setQuizState("active");
  }

  function selectAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
  }

  function advance() {
    if (selected === null) return;
    const next = [...answers, selected];
    setAnswers(next);
    if (currentQ + 1 < total) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      setQuizState("done");
    }
  }

  const q = quizQuestions[currentQ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate, #certificate * { visibility: visible !important; }
          #certificate { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
        }
      `}</style>

      <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12 relative z-10">

          <Link href="/opportunities" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors w-fit">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            All Opportunities
          </Link>

          {/* Hero */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent bg-goldAccent/10 border border-goldAccent/20 px-3 py-1 rounded-full">{lesson.type}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${difficultyColor[lesson.difficulty]}`}>{lesson.difficulty}</span>
              <span className="text-[10px] font-semibold text-zinc-500">{lesson.time} read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white leading-tight">{lesson.title}</h1>
            <p className="text-base text-textSecondary leading-relaxed max-w-2xl">{lesson.tagline}</p>
            <div className="flex flex-wrap gap-6 pt-2 border-t border-white/[0.05] mt-2">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Career Impact</span>
                <span className="text-sm font-bold text-tealAccent">{lesson.impact}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Adopters</span>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.adopters.map((a) => (
                    <span key={a} className="text-[10px] font-semibold text-white bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Signal */}
          <div className="bg-goldAccent/[0.03] border border-goldAccent/20 rounded-2xl px-6 py-5 flex items-start gap-4">
            <span className="text-2xl font-extrabold text-goldAccent shrink-0">{lesson.signalDelta}</span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent block mb-1">Traction Signal</span>
              <p className="text-sm text-textSecondary leading-relaxed">{lesson.signal}</p>
            </div>
          </div>

          {/* Overview */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-display font-extrabold text-white">What is it?</h2>
            <p className="text-sm text-textSecondary leading-relaxed">{lesson.overview}</p>
          </section>

          {/* Why Now */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-display font-extrabold text-white">Why now?</h2>
            <p className="text-sm text-textSecondary leading-relaxed">{lesson.whyNow}</p>
          </section>

          {/* Key Concepts */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-display font-extrabold text-white">Key Concepts</h2>
            <div className="flex flex-col gap-3">
              {lesson.concepts.map((c, i) => (
                <div key={i} className="bg-panel border border-white/[0.05] rounded-2xl px-6 py-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[10px] font-extrabold text-accent shrink-0">{i + 1}</span>
                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed pl-8">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Code Sample */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-display font-extrabold text-white">{lesson.codeTitle}</h2>
            <div className="rounded-2xl overflow-hidden border border-white/[0.07]">
              <div className="bg-[#0D1520] px-5 py-3 flex items-center justify-between border-b border-white/[0.05]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/40" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
                  <span className="w-3 h-3 rounded-full bg-green-500/40" />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{lesson.codeLang}</span>
              </div>
              <pre className="bg-[#080F1A] px-6 py-5 overflow-x-auto text-[13px] leading-relaxed font-mono text-zinc-300">
                <code>{lesson.code}</code>
              </pre>
            </div>
          </section>

          {/* Resources */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-display font-extrabold text-white">Next Steps + Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="group bg-panel border border-white/[0.05] rounded-2xl px-5 py-4 flex flex-col gap-2 hover:border-accent/30 hover:bg-panel/80 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">{r.label}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${tagColor[r.tag] ?? "bg-white/[0.04] text-zinc-400 border-white/[0.08]"}`}>{r.tag}</span>
                  </div>
                  <p className="text-xs text-textSecondary">{r.description}</p>
                  <span className="text-[10px] text-zinc-600 font-mono truncate">{r.url.replace("https://", "")}</span>
                </a>
              ))}
            </div>
          </section>

          {/* QUIZ */}
          <section className="flex flex-col gap-6 border-t border-white/[0.05] pt-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Noviqe Assessment</span>
                <h2 className="text-lg font-display font-extrabold text-white">Test Your Knowledge</h2>
                <p className="text-xs text-textSecondary mt-1">
                  {QUIZ_SIZE} randomly selected questions · Pass with {Math.round(PASS_THRESHOLD * 100)}%+ to earn your certificate · {lesson.questionBank.length} questions in pool
                </p>
              </div>
              {quizState === "idle" && (
                <button onClick={() => setQuizState("naming")}
                  className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all shrink-0">
                  Start Assessment
                </button>
              )}
            </div>

            {/* Name entry */}
            {quizState === "naming" && (
              <div className="bg-panel border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-sm text-textSecondary">Enter your name as it should appear on your certificate.</p>
                <input type="text" placeholder="Your full name" value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  className="bg-[#0D1520] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-accent/50 transition-colors max-w-sm"
                  onKeyDown={(e) => e.key === "Enter" && learnerName.trim() && beginQuiz()} />
                <button onClick={beginQuiz} disabled={!learnerName.trim()}
                  className="px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all w-fit">
                  Begin Assessment
                </button>
              </div>
            )}

            {/* Active quiz */}
            {quizState === "active" && q && (
              <div className="bg-panel border border-white/[0.06] rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${(currentQ / total) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 shrink-0">{currentQ + 1} / {total}</span>
                </div>

                <div>
                  <p className="text-base font-bold text-white leading-snug mb-5">{q.q}</p>
                  <div className="flex flex-col gap-2.5">
                    {q.options.map((opt, i) => {
                      let cls = "border border-white/[0.06] bg-white/[0.02] text-textSecondary hover:border-accent/40 hover:text-white cursor-pointer";
                      if (selected !== null) {
                        if (i === q.answer) cls = "border border-tealAccent/60 bg-tealAccent/5 text-tealAccent cursor-default";
                        else if (i === selected && selected !== q.answer) cls = "border border-red-400/50 bg-red-400/5 text-red-400 cursor-default";
                        else cls = "border border-white/[0.04] bg-white/[0.01] text-zinc-600 cursor-default";
                      }
                      return (
                        <button key={i} onClick={() => selectAnswer(i)}
                          className={`text-left px-4 py-3 rounded-xl text-sm transition-all ${cls}`}>
                          <span className="font-semibold text-[10px] uppercase tracking-widest mr-3 opacity-50">{["A", "B", "C", "D"][i]}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selected !== null && (
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-xs font-bold ${selected === q.answer ? "text-tealAccent" : "text-red-400"}`}>
                      {selected === q.answer ? "Correct!" : `Incorrect — correct answer: ${q.options[q.answer]}`}
                    </p>
                    <button onClick={advance}
                      className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all shrink-0">
                      {currentQ + 1 < total ? "Next Question" : "See Results"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            {quizState === "done" && (
              <div className="flex flex-col gap-6">
                <div className={`rounded-2xl p-6 border flex flex-col sm:flex-row items-start sm:items-center gap-6 ${passed ? "bg-tealAccent/[0.03] border-tealAccent/20" : "bg-red-400/[0.03] border-red-400/20"}`}>
                  <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 font-extrabold ${passed ? "bg-tealAccent/10 text-tealAccent" : "bg-red-400/10 text-red-400"}`}>
                    <span className="text-2xl">{pct}%</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-70">{score}/{total}</span>
                  </div>
                  <div>
                    <h3 className={`text-lg font-display font-extrabold mb-1 ${passed ? "text-tealAccent" : "text-red-400"}`}>
                      {passed ? "Assessment Passed!" : "Not quite — try again"}
                    </h3>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      {passed
                        ? `You scored ${pct}% — your Noviqe certificate is ready below.`
                        : `You scored ${pct}%. You need ${Math.round(PASS_THRESHOLD * 100)}% to pass. Questions are randomised each attempt, so keep studying and try again.`}
                    </p>
                    {!passed && (
                      <button onClick={() => { setQuizState("naming"); }}
                        className="mt-3 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all">
                        Retake Assessment
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-question review */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Question Review</p>
                  {quizQuestions.map((qq, i) => {
                    const correct = answers[i] === qq.answer;
                    return (
                      <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs ${correct ? "border-tealAccent/15 bg-tealAccent/[0.02]" : "border-red-400/15 bg-red-400/[0.02]"}`}>
                        <span className={`mt-0.5 shrink-0 font-extrabold ${correct ? "text-tealAccent" : "text-red-400"}`}>{correct ? "✓" : "✗"}</span>
                        <div>
                          <p className="text-white font-medium">{qq.q}</p>
                          {!correct && (
                            <p className="text-zinc-400 mt-0.5">Correct answer: <span className="text-tealAccent">{qq.options[qq.answer]}</span></p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Certificate */}
                {passed && (
                  <div className="flex flex-col gap-4 pt-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Your Certificate</p>
                      <button onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-goldAccent hover:bg-[#e0b23f] text-black rounded-xl text-xs font-bold transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" /></svg>
                        Print Certificate
                      </button>
                    </div>

                    <div id="certificate" className="bg-white rounded-3xl p-10 md:p-14 flex flex-col items-center text-center border-[6px] border-double border-[#6C63FF] shadow-2xl">
                      <div className="flex items-center gap-2 mb-8">
                        <span className="w-8 h-8 rounded-full bg-[#6C63FF] flex items-center justify-center text-white font-black text-sm">N</span>
                        <span className="text-[#07111F] font-extrabold text-xl tracking-tight">Noviqe</span>
                      </div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#6C63FF] mb-3">Certificate of Completion</p>
                      <p className="text-sm text-[#4a5568] mb-4">This certifies that</p>
                      <p className="text-3xl md:text-4xl font-display font-extrabold text-[#07111F] mb-4 leading-tight">{learnerName}</p>
                      <p className="text-sm text-[#4a5568] mb-2">has successfully completed the Noviqe assessment for</p>
                      <p className="text-xl font-bold text-[#6C63FF] mb-8 max-w-sm leading-snug">{lesson.title}</p>
                      <div className="flex items-center gap-8 mb-8">
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-[#9aa3af] uppercase tracking-widest">Score</p>
                          <p className="text-lg font-extrabold text-[#07111F]">{pct}%</p>
                        </div>
                        <div className="w-px h-8 bg-[#e2e8f0]" />
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-[#9aa3af] uppercase tracking-widest">Date</p>
                          <p className="text-sm font-bold text-[#07111F]">{dateStr}</p>
                        </div>
                        <div className="w-px h-8 bg-[#e2e8f0]" />
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-[#9aa3af] uppercase tracking-widest">Certificate ID</p>
                          <p className="text-[11px] font-mono font-bold text-[#07111F]">{certId.current}</p>
                        </div>
                      </div>
                      <div className="w-full max-w-xs h-px bg-[#e2e8f0] mb-6" />
                      <p className="text-[10px] text-[#9aa3af]">Issued by Noviqe AI Intelligence Platform</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="border-t border-white/[0.05] pt-8 flex justify-between items-center">
            <Link href="/opportunities" className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors">View all opportunities</Link>
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
