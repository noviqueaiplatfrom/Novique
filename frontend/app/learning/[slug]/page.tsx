"use client";

import { use, useState, useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

interface Resource { label: string; url: string; description: string; tag: string }
interface Concept { title: string; body: string }
interface Question { q: string; options: string[]; answer: number; code?: string }
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
    whyNow: "Every major AI IDE now ships MCP support out of the box. Enterprise teams are standardizing their internal tool exposure on MCP rather than building per-client adapters. Engineers who can build and maintain MCP servers are being hired specifically for this skill.",
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

server.tool(
  "read_file",
  "Read a file from the local filesystem",
  { path: z.string().describe("Absolute path to the file") },
  async ({ path }) => {
    const content = await fs.readFile(path, "utf-8");
    return { content: [{ type: "text", text: content }] };
  }
);

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
      { q: "When should you migrate from stdio to HTTP transport?", options: ["When using TypeScript instead of Python", "When the server exposes more than 10 tools", "When you need to share the server across a team or deploy it", "When using Claude Desktop"], answer: 2 },
      { q: "What is an MCP Host?", options: ["The cloud provider running the server", "The process that manages the MCP client lifecycle", "The AI model itself", "The authentication service"], answer: 1 },
      { q: "What is the purpose of a Prompt primitive in MCP?", options: ["Inject system instructions at runtime", "Reusable, parameterized message templates", "Control the model temperature", "Define the server name and version"], answer: 1 },
      { q: "In stdio transport, how is the MCP server process started?", options: ["It registers with a discovery service", "The user launches it manually", "The client launches it as a subprocess", "It runs as a system daemon"], answer: 2 },
      { q: "What is the primary advantage of MCP over per-client custom integrations?", options: ["It auto-generates tests", "It reduces token usage", "One server works with any MCP-compatible client", "It provides built-in authentication"], answer: 2 },
      { q: "Which AI client natively supports MCP?", options: ["GPT-4o Playground", "Gemini Advanced", "Cursor", "Perplexity"], answer: 2 },
      { q: "What does SSE stand for in MCP HTTP transport?", options: ["Server-Side Execution", "Secure Socket Exchange", "Server-Sent Events", "Synchronized State Endpoint"], answer: 2 },
      { q: "What library provides runtime schema validation for MCP tool inputs in TypeScript?", options: ["Joi", "Yup", "Zod", "AJV"], answer: 2 },
      { q: "Which scenario best justifies using HTTP transport over stdio?", options: ["The tool has a large input schema", "Multiple engineers need to share the same server", "The server is written in Python", "The model makes more than 5 tool calls"], answer: 1 },
      { q: "What does `server.connect(transport)` do?", options: ["Sends a ping to the client", "Starts listening for client requests over the given transport", "Registers the server with a discovery API", "Validates all tool schemas"], answer: 1 },
      { q: "What does `isError: true` signal to the model in a tool response?", options: ["The server crashed", "The tool execution encountered a logical error the model should handle", "The request should be retried", "The response is a debug message"], answer: 1 },
      { q: "What is the role of the `description` argument passed to `server.tool()`?", options: ["It sets the tool version", "It helps the model decide when and how to call the tool", "It defines the return type", "It configures logging"], answer: 1 },
      { q: "What does `z.string().optional()` do to a tool parameter?", options: ["Makes the parameter accept numbers too", "Makes the parameter not required — the model can omit it", "Validates the string is non-empty", "Adds a default value of null"], answer: 1 },
      { q: "What npm package provides McpServer and StdioServerTransport?", options: ["@anthropic-ai/sdk", "@modelcontextprotocol/sdk", "@openai/mcp", "mcp-server-core"], answer: 1 },
      { q: "What does `server.resource()` expose to the model?", options: ["A callable function", "Readable data at a URI", "A reusable message template", "An API endpoint"], answer: 1 },
      {
        q: "What does this tool return when called with `{ a: 3, b: 4 }`?",
        code: `server.tool("add", "Add two numbers", {
  a: z.number(),
  b: z.number()
}, async ({ a, b }) => {
  return { content: [{ type: "text", text: String(a + b) }] };
});`,
        options: ["The number 7", 'The string "7" wrapped in MCP text content', "{ a: 3, b: 4 }", "A JSON object with the sum"],
        answer: 1
      },
      {
        q: "What happens after this code runs?",
        code: `const server = new McpServer({ name: "demo", version: "1.0.0" });
server.tool("ping", "Health check", {}, async () => ({
  content: [{ type: "text", text: "pong" }]
}));
const transport = new StdioServerTransport();
await server.connect(transport);`,
        options: ["Validates all tool schemas and exits", "Starts the server and listens for client messages over stdio", "Registers the server with Claude Desktop automatically", 'Sends "pong" to the client immediately'],
        answer: 1
      },
      {
        q: "How many tools does this server expose to the model?",
        code: `const server = new McpServer({ name: "multi", version: "1.0.0" });
server.tool("tool_a", "Tool A", {}, async () => ({ content: [{ type: "text", text: "a" }] }));
server.tool("tool_b", "Tool B", {}, async () => ({ content: [{ type: "text", text: "b" }] }));
server.tool("tool_c", "Tool C", {}, async () => ({ content: [{ type: "text", text: "c" }] }));
await server.connect(new StdioServerTransport());`,
        options: ["1", "2", "3", "4"],
        answer: 2
      },
      {
        q: "What does `z.string().min(1).max(50)` enforce?",
        code: `server.tool("greet", "Greet a user", {
  name: z.string().min(1).max(50)
}, async ({ name }) => {
  return { content: [{ type: "text", text: "Hello, " + name + "!" }] };
});`,
        options: ["Name must be exactly 50 characters", "Name must be between 1 and 50 characters", "Name is optional with a 50-char default", "Name is truncated to 50 chars automatically"],
        answer: 1
      },
      {
        q: "What value does `limit` have when the model calls this tool without specifying it?",
        code: `server.tool("search", "Search files", {
  query: z.string(),
  limit: z.number().optional().default(10)
}, async ({ query, limit }) => {
  return { content: [{ type: "text", text: "limit: " + limit }] };
});`,
        options: ["undefined", "null", "0", "10"],
        answer: 3
      },
      {
        q: "What type of MCP primitive does this code define?",
        code: `server.resource("readme", "file:///README.md", async (uri) => {
  const text = await fs.readFile(uri.pathname, "utf-8");
  return { contents: [{ uri: uri.href, text }] };
});`,
        options: ["Tool", "Resource", "Prompt", "Transport"],
        answer: 1
      },
      {
        q: "What MCP primitive does this code register?",
        code: `server.prompt("code_review", "Review code for issues", {
  code: z.string()
}, ({ code }) => ({
  messages: [{
    role: "user",
    content: { type: "text", text: "Review this:\\n\\n" + code }
  }]
}));`,
        options: ["Tool", "Resource", "Prompt", "Handler"],
        answer: 2
      },
      {
        q: "What does this Claude Desktop config file do?",
        code: `{
  "mcpServers": {
    "file-reader": {
      "command": "node",
      "args": ["./dist/server.js"],
      "env": { "BASE_DIR": "/home/user/docs" }
    }
  }
}`,
        options: ["Registers the server with a cloud registry", "Tells Claude Desktop to launch the server as a subprocess with an env variable", "Deploys the server to a remote host", "Configures HTTP transport for the server"],
        answer: 1
      },
      {
        q: "What does `z.string().uuid()` enforce on the `id` parameter?",
        code: `server.tool("get_user", "Get user by ID", {
  id: z.string().uuid()
}, async ({ id }) => {
  const user = await db.getUser(id);
  return { content: [{ type: "text", text: JSON.stringify(user) }] };
});`,
        options: ["id must be a number formatted as a string", "id must follow UUID format", "id must be exactly 36 characters", "id must contain only hex characters"],
        answer: 1
      },
      {
        q: "What does this resource return when the database returns 0 rows?",
        code: `server.resource("users", "db://users/all", async (uri) => {
  const users = await db.query("SELECT * FROM users LIMIT 10");
  return { contents: [{ uri: uri.href, text: JSON.stringify(users) }] };
});`,
        options: ["null", '"undefined"', '"[]"', "An MCP error response"],
        answer: 2
      },
      {
        q: "What does this tool return when called with `{ a: 10, b: 0 }`?",
        code: `server.tool("divide", "Divide two numbers", {
  a: z.number(),
  b: z.number()
}, async ({ a, b }) => {
  return { content: [{ type: "text", text: String(a / b) }] };
});`,
        options: ['An error: "Division by zero"', '"Infinity"', '"NaN"', '"0"'],
        answer: 1
      },
      {
        q: "What happens when this tool is called with `{ level: 'verbose' }`?",
        code: `server.tool("set_level", "Set log level", {
  level: z.enum(["debug", "info", "warn", "error"])
}, async ({ level }) => {
  return { content: [{ type: "text", text: "Level: " + level }] };
});`,
        options: ["Sets log level to verbose", "Silently uses 'info' as fallback", "Zod validation fails and MCP returns an error", "The server crashes"],
        answer: 2
      },
      {
        q: "What constraint does this schema place on `priority`?",
        code: `server.tool("create_note", "Create a note", {
  title: z.string(),
  priority: z.number().int().min(1).max(5)
}, async ({ title, priority }) => {
  return { content: [{ type: "text", text: "Created" }] };
});`,
        options: ["Priority must be a float between 1.0 and 5.0", "Priority must be a whole number between 1 and 5", "Priority must be a string", "Priority defaults to 1"],
        answer: 1
      },
      {
        q: "What does the SIGINT handler do here?",
        code: `const transport = new StdioServerTransport();
await server.connect(transport);
process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});`,
        options: ["Restarts the server on Ctrl+C", "Gracefully closes the MCP server before the process exits", "Prevents exit on Ctrl+C", "Sends shutdown to the MCP client"],
        answer: 1
      },
      {
        q: "What is wrong with this tool handler's return value?",
        code: `server.tool("greet", "Greet user", { name: z.string() }, async ({ name }) => {
  return "Hello, " + name + "!";
});`,
        options: ["Nothing — strings are valid", "Must return MCP content format: { content: [{ type: 'text', text: '...' }] }", "Must return a Buffer", "Must return a Promise<string>"],
        answer: 1
      },
      {
        q: "What is wrong with this handler?",
        code: `server.tool("query_db", "Query database", { sql: z.string() }, ({ sql }) => {
  return db.query(sql);
});`,
        options: ["Nothing — this is valid", "Handler is not async and returns a raw Promise, not MCP content format", "The parameter name 'sql' is reserved", "db.query requires a callback"],
        answer: 1
      },
      {
        q: "What problem does this tool definition have?",
        code: `server.tool("get_weather", "", { city: z.string() }, async ({ city }) => {
  const data = await weatherAPI.get(city);
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
});`,
        options: ["city should be z.enum not z.string", "The description is empty — models use it to decide when to call the tool", "The return format is incorrect", "weatherAPI is not defined"],
        answer: 1
      },
      {
        q: "What is wrong with this McpServer constructor call?",
        code: `const server = new McpServer({ name: "my-server" });`,
        options: ["name must be camelCase", "version field is missing", "McpServer requires a port number", "name cannot contain hyphens"],
        answer: 1
      },
      {
        q: "What is the security bug in this tool?",
        code: `server.tool("read_file", "Read any file", { path: z.string() }, async ({ path }) => {
  const content = await fs.readFile(path, "utf-8");
  return { content: [{ type: "text", text: content }] };
});`,
        options: ["fs.readFile should be fsSync", "No path sanitization — the model could read any file including /etc/passwd", "utf-8 encoding is invalid", "The description says 'any file'"],
        answer: 1
      },
      {
        q: "What happens if this tool's fetch call throws a network error?",
        code: `server.tool("fetch_api", "Fetch from API", {
  url: z.string().url()
}, async ({ url }) => {
  const res = await fetch(url);
  const data = await res.json();
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
});`,
        options: ["The server crashes", "The MCP SDK catches it and returns an MCP error response to the model", "The tool returns an empty array", "The tool silently retries"],
        answer: 1
      },
      {
        q: "What does `z.array(z.string())` validate for `tags`?",
        code: `server.tool("tag_item", "Tag an item", {
  itemId: z.string(),
  tags: z.array(z.string())
}, async ({ itemId, tags }) => {
  return { content: [{ type: "text", text: "Tagged" }] };
});`,
        options: ["tags must be a comma-separated string", "tags must be an array where every element is a string", "tags must be an array of numbers", "tags must have exactly 3 elements"],
        answer: 1
      },
      {
        q: "What does `z.string().url()` validate?",
        code: `server.tool("fetch_page", "Fetch a web page", {
  url: z.string().url()
}, async ({ url }) => {
  const res = await fetch(url);
  return { content: [{ type: "text", text: await res.text() }] };
});`,
        options: ["That url is a valid domain without protocol", "That url is a well-formed URL", "That url starts with https://", "That url is reachable"],
        answer: 1
      },
      {
        q: "What does `typeof server.tool` print?",
        code: `const server = new McpServer({ name: "test", version: "0.1.0" });
console.log(typeof server.tool);`,
        options: ['"undefined"', '"object"', '"function"', '"symbol"'],
        answer: 2
      },
      {
        q: "What does this tool return when called with `{ tags: [] }`?",
        code: `server.tool("get_by_tags", "Find items by tags", {
  tags: z.array(z.string()).min(1)
}, async ({ tags }) => {
  const items = await db.findByTags(tags);
  return { content: [{ type: "text", text: JSON.stringify(items) }] };
});`,
        options: ["Returns items with no tags", "Zod validation fails — array must have at least 1 element", "Returns an empty array", "Returns null"],
        answer: 1
      },
      {
        q: "What does `z.number().int().min(0)` enforce?",
        code: `server.tool("paginate", "List records", {
  page: z.number().int().min(0),
  size: z.number().int().min(1).max(100)
}, async ({ page, size }) => {
  return { content: [{ type: "text", text: "ok" }] };
});`,
        options: ["page must be a float >= 0", "page must be a non-negative integer (0, 1, 2, ...)", "page must be between 0 and 100", "page defaults to 0"],
        answer: 1
      },
      {
        q: "What does this import structure tell you about the SDK?",
        code: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";`,
        options: ["Two separate npm packages are needed", "Both come from one package with deep path imports", "The .js extension means these are CommonJS modules only", "mcp.js and stdio.js must be installed separately"],
        answer: 1
      },
      {
        q: "How many content items does this response include?",
        code: `return {
  content: [
    { type: "text", text: "Analysis complete." },
    { type: "text", text: "Found 3 issues." },
    { type: "text", text: "Recommend refactoring." }
  ]
};`,
        options: ["1", "2", "3", "4"],
        answer: 2
      },
      {
        q: "What does this tool do when called without specifying `format`?",
        code: `server.tool("export", "Export data", {
  data: z.string(),
  format: z.enum(["json", "csv", "xml"]).default("json")
}, async ({ data, format }) => {
  return { content: [{ type: "text", text: convert(data, format) }] };
});`,
        options: ["Throws a validation error", "Uses JSON format by default", "Uses the first available format", "Returns raw data without conversion"],
        answer: 1
      },
      {
        q: "What does the `env` field in this Claude Desktop config do?",
        code: `{
  "mcpServers": {
    "db-reader": {
      "command": "node",
      "args": ["server.js"],
      "env": { "DATABASE_URL": "postgresql://localhost/mydb" }
    }
  }
}`,
        options: ["Sets environment variables in the user's shell", "Passes environment variables to the MCP server subprocess", "Configures database connection pooling", "Defines the server's API keys"],
        answer: 1
      },
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
    whyNow: "Hosted API costs are predictable, but fine-tuned local models can cut per-token cost to zero for high-volume use cases. Startups are building domain-specific models (legal, medical, code, customer support) and Unsloth makes this feasible without a cluster.",
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

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3.2-3b-instruct",
    max_seq_length=2048,
    load_in_4bit=True,
)

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
      { q: "Approximately what percentage of parameters does LoRA train?", options: ["50%", "25%", "10%", "~1%"], answer: 3 },
      { q: "Which dataset format does Unsloth primarily expect?", options: ["Raw plaintext paragraphs", "CSV with input/output columns", "ShareGPT or Alpaca instruction format", "HuggingFace Arrow binary format"], answer: 2 },
      { q: "How much faster is Unsloth compared to standard HuggingFace training?", options: ["1.2x", "2-5x", "10x", "50x"], answer: 1 },
      { q: "Which layers does LoRA inject adapter matrices into?", options: ["Normalization layers", "Embedding layers only", "Attention projection layers (q_proj, k_proj, etc.)", "Output classifier layers"], answer: 2 },
      { q: "What library does Unsloth use for quantization under the hood?", options: ["ONNX Runtime", "TensorRT", "bitsandbytes", "OpenVINO"], answer: 2 },
      { q: "What does QLoRA combine?", options: ["LoRA adapters with knowledge distillation", "LoRA adapters with 4-bit quantization of the base model", "LoRA with full fine-tuning on the last layer", "Quantization with MoE routing"], answer: 1 },
      { q: "What is the typical range for the LoRA rank `r`?", options: ["1-4", "8-64", "100-256", "512-1024"], answer: 1 },
      { q: "What does SFTTrainer stand for?", options: ["Supervised Fine-Tuning Trainer", "Scaled Feature Training Runner", "Sequence Fidelity Tracker", "Shared Foundation Tuner"], answer: 0 },
      { q: "Why does LoRA keep the original model weights frozen?", options: ["Frozen weights train faster", "To allow the same base model to serve multiple adapters and preserve pretrained knowledge", "HuggingFace requires it", "To reduce batch size"], answer: 1 },
      { q: "How much VRAM reduction does Unsloth achieve compared to standard training?", options: ["~10%", "~30%", "~60%", "~90%"], answer: 2 },
      { q: "What does `target_modules` specify in `get_peft_model()`?", options: ["Layers to freeze completely", "Layers that receive LoRA adapter matrices", "Modules excluded from quantization", "Output format of the saved model"], answer: 1 },
      { q: "Which model families does Unsloth officially support?", options: ["Only Llama", "GPT-2 and BERT only", "Llama, Mistral, Gemma, and Phi", "Only models under 7B parameters"], answer: 2 },
      { q: "What is the key trade-off of 4-bit quantization?", options: ["Training is slower but more accurate", "Slight accuracy reduction in exchange for much lower VRAM usage", "Model files are larger but inference is faster", "Requires proprietary Nvidia hardware"], answer: 1 },
      { q: "What does `lora_alpha` control relative to `r`?", options: ["The dropout rate", "A scaling factor that determines the magnitude of adapter updates", "The number of attention heads targeted", "The maximum sequence length"], answer: 1 },
      { q: "What happens to the base model weights during LoRA training?", options: ["They are updated along with adapters", "They remain frozen — only adapter weights are updated", "They are re-initialized", "They are compressed to 4-bit"], answer: 1 },
      { q: "What does `bias='none'` mean in the LoRA config?", options: ["Bias terms are set to zero", "Bias parameters are not included in the trainable adapter", "The model has no bias layers", "Bias is computed automatically"], answer: 1 },
      { q: "What is a LoRA adapter file at inference time?", options: ["A separate full-size model", "A small set of weights (~few hundred MB) that are added on top of the frozen base model", "A quantized copy of the base model", "A tokenizer extension"], answer: 1 },
      { q: "What does `FastLanguageModel.for_inference(model)` do?", options: ["Starts a new fine-tuning run", "Switches the model to optimized inference mode", "Evaluates on a test set", "Exports to ONNX"], answer: 1 },
      {
        q: "What does `load_in_4bit=True` do when loading the model?",
        code: `model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3.2-3b-instruct",
    max_seq_length=2048,
    load_in_4bit=True,
)`,
        options: ["Loads only the first 4 layers", "Quantizes the base model weights to 4-bit integers, reducing VRAM by ~75%", "Sets the output to 4-bit precision", "Limits inference to 4 tokens per second"],
        answer: 1
      },
      {
        q: "What is `r=16` specifying in this LoRA config?",
        code: `model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
)`,
        options: ["The learning rate multiplier", "The LoRA rank — the size of the trainable low-rank adapter matrices", "The number of training epochs", "The quantization bit depth"],
        answer: 1
      },
      {
        q: "What does `gradient_accumulation_steps=4` effectively achieve?",
        code: `args = TrainingArguments(
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    max_steps=100,
    learning_rate=2e-4,
    output_dir="./outputs",
)`,
        options: ["Reduces learning rate by 4x", "Quadruples the effective batch size without using more VRAM", "Runs 4 training jobs in parallel", "Saves a checkpoint every 4 steps"],
        answer: 1
      },
      {
        q: "What does `model.save_pretrained('my-fine-tuned-model')` save in a LoRA setup?",
        code: `trainer.train()
model.save_pretrained("my-fine-tuned-model")
tokenizer.save_pretrained("my-fine-tuned-model")`,
        options: ["The full model weights including the frozen base", "The LoRA adapter weights only", "The tokenizer only", "A compressed GGUF file"],
        answer: 1
      },
      {
        q: "What is the effective batch size given these training arguments?",
        code: `args = TrainingArguments(
    per_device_train_batch_size=4,
    gradient_accumulation_steps=8,
    max_steps=200,
    learning_rate=2e-4,
    output_dir="./outputs",
)`,
        options: ["4", "8", "32", "200"],
        answer: 2
      },
      {
        q: "What does this code do after training?",
        code: `model.save_pretrained("lora_model")
model.save_pretrained_merged("full_model", tokenizer, save_method="merged_16bit")`,
        options: ["Saves two identical copies of the model", "Saves the LoRA adapter, then saves the merged full model in 16-bit precision", "Saves the model twice with different quantization", "Exports to ONNX format"],
        answer: 1
      },
      {
        q: "What does `lora_dropout=0` mean?",
        code: `model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0,
    bias="none",
)`,
        options: ["Dropout is disabled (0% drop rate)", "Dropout randomly zeros 100% of adapter weights", "The model ignores adapter weights during training", "Dropout rate is automatically selected"],
        answer: 0
      },
      {
        q: "What does this inference code produce?",
        code: `FastLanguageModel.for_inference(model)
inputs = tokenizer("What is LoRA?", return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100)
print(tokenizer.decode(outputs[0]))`,
        options: ["Starts a new fine-tuning run", "Runs inference on the fine-tuned model and decodes the output", "Evaluates model accuracy on a test set", "Exports the model to ONNX"],
        answer: 1
      },
      {
        q: "What does `max_seq_length=2048` limit?",
        code: `model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3.2-3b-instruct",
    max_seq_length=2048,
    load_in_4bit=True,
)`,
        options: ["The maximum number of training steps", "The maximum number of tokens in a single forward pass", "The output vocabulary size", "The number of attention heads"],
        answer: 1
      },
      {
        q: "What does `use_cache=True` do during inference?",
        code: `outputs = model.generate(
    **inputs,
    max_new_tokens=200,
    use_cache=True
)`,
        options: ["Caches model weights to RAM", "Enables KV-cache to avoid recomputing attention for generated tokens — speeds up generation", "Caches the dataset between runs", "Saves generated text to disk"],
        answer: 1
      },
      {
        q: "What does this alpaca formatter produce?",
        code: `alpaca_prompt = """### Instruction:
{}

### Input:
{}

### Response:
{}"""

def format_prompt(instruction, inp, output):
    return alpaca_prompt.format(instruction, inp, output)`,
        options: ["Tokenizes the input for the model", "Formats instruction-input-output triples into Alpaca prompt format for fine-tuning", "Evaluates the model on a benchmark", "Converts the dataset to ShareGPT format"],
        answer: 1
      },
      {
        q: "What does this code use to load the training data?",
        code: `from datasets import load_dataset
dataset = load_dataset(
    "json",
    data_files={"train": "train.jsonl", "test": "test.jsonl"}
)`,
        options: ["CSV files", "JSONL (JSON Lines) files for both train and test splits", "A HuggingFace Hub dataset", "Parquet files"],
        answer: 1
      },
      {
        q: "What is wrong with this training setup for a 50-sample dataset?",
        code: `trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        max_steps=10000,
        learning_rate=2e-4,
        output_dir="./outputs",
    ),
)`,
        options: ["per_device_train_batch_size must be 1", "10000 steps on 50 samples causes extreme overfitting", "learning_rate is too low", "dataset_text_field is missing"],
        answer: 1
      },
      {
        q: "What does this print about LoRA parameter efficiency?",
        code: `model = FastLanguageModel.get_peft_model(model, r=16, ...)
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total = sum(p.numel() for p in model.parameters())
print(f"{100 * trainable / total:.2f}% trainable")`,
        options: ["~100% — all parameters are trainable", "~50% — half the parameters are adapters", "~1-2% — only the small adapter matrices are trainable", "0% — LoRA uses no trainable parameters"],
        answer: 2
      },
      {
        q: "What is missing from this code that would prevent loading the adapter for inference?",
        code: `model.save_pretrained("my_adapter")
# Later, loading:
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3.2-3b-instruct",
    max_seq_length=2048,
    load_in_4bit=True,
)`,
        options: ["Nothing — model loads the adapter automatically", "The adapter is never loaded — need model.load_adapter('my_adapter') after from_pretrained", "tokenizer must be saved separately", "from_pretrained does not support adapters"],
        answer: 1
      },
      {
        q: "What does this conversion function do?",
        code: `def convert_to_sharegpt(row):
    return {
        "conversations": [
            {"from": "human", "value": row["question"]},
            {"from": "gpt", "value": row["answer"]}
        ]
    }
dataset = dataset.map(convert_to_sharegpt)`,
        options: ["Translates the dataset to another language", "Converts Q&A pairs into ShareGPT conversation format for fine-tuning", "Filters out low-quality samples", "Tokenizes the dataset"],
        answer: 1
      },
      {
        q: "What does `r=4` versus `r=64` trade off?",
        code: `# Config A
model_a = FastLanguageModel.get_peft_model(model, r=4, ...)
# Config B
model_b = FastLanguageModel.get_peft_model(model, r=64, ...)`,
        options: ["r=4 trains faster with less VRAM but less expressive adapters; r=64 is more expressive but uses more VRAM", "r=4 is more accurate; r=64 trains faster", "r=4 uses more VRAM; r=64 uses less", "There is no practical difference"],
        answer: 0
      },
      {
        q: "What does this HuggingFace dataset load call do?",
        code: `dataset = load_dataset("json", data_files="your_data.jsonl", split="train")`,
        options: ["Downloads a dataset from HuggingFace Hub", "Loads a local JSONL file as the training split", "Splits the data 80/20 automatically", "Validates the JSONL format"],
        answer: 1
      },
      {
        q: "What do these two lines save?",
        code: `model.save_pretrained("./adapter")
tokenizer.save_pretrained("./adapter")`,
        options: ["The full merged model and vocabulary", "The LoRA adapter weights and the tokenizer to the same directory", "Two separate model checkpoints", "Only the tokenizer — model.save_pretrained is a no-op here"],
        answer: 1
      },
      {
        q: "What is `lora_alpha / r` equal to when `lora_alpha=32` and `r=16`?",
        code: `model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0,
    bias="none",
)`,
        options: ["0.5", "1.0", "2.0", "32"],
        answer: 2
      },
      {
        q: "What does this training step count produce for a 1000-sample dataset with batch size 2?",
        code: `args = TrainingArguments(
    per_device_train_batch_size=2,
    gradient_accumulation_steps=1,
    num_train_epochs=3,
    output_dir="./outputs",
)`,
        options: ["100 steps", "500 steps", "1500 steps", "3000 steps"],
        answer: 2
      },
    ],
  },

  "kolmogorov-arnold-networks": {
    slug: "kolmogorov-arnold-networks", type: "Research Paper Practice",
    title: "Kolmogorov-Arnold Networks (KANs)",
    tagline: "Interpretable architectures replacing MLPs in scientific computing",
    signal: "High performance-to-compute ratio in physics and biology models.",
    signalDelta: "Emerging", time: "60 minutes", difficulty: "Advanced",
    impact: "High", adopters: ["MIT Physics Labs", "DeepMind Biological Research"],
    overview: "Kolmogorov-Arnold Networks replace the fixed activation functions in traditional MLPs with learnable activation functions on the network's edges, implemented as B-splines. This makes networks smaller, more interpretable, and better suited to symbolic regression and physics-simulation tasks where you need to understand the learned function, not just approximate it.",
    whyNow: "The original KAN paper from MIT showed competitive accuracy with MLPs at a fraction of the parameter count for scientific tasks. DeepMind's biology teams are applying KANs to protein interaction models. The opportunity is in converting research implementations into production-grade wrappers.",
    concepts: [
      { title: "Learnable Activations on Edges", body: "Traditional MLPs place fixed activations on nodes (neurons). KANs place learnable B-spline functions on edges (weights). Each edge learns its own nonlinear transformation." },
      { title: "B-Splines", body: "B-splines are piecewise polynomial functions defined by control points (knots). The network learns the knot positions and weights. You can visualize and simplify the learned splines — a KAN can literally show you the mathematical function it learned." },
      { title: "When to Use KANs vs MLPs", body: "KANs outperform MLPs on low-dimensional scientific tasks where interpretability matters. MLPs are still better for high-dimensional perception tasks (vision, language). KANs are not a drop-in replacement." },
    ],
    codeTitle: "KAN from scratch with pykan (Python)",
    codeLang: "python",
    code: `from kan import KAN
import torch

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

results = model.train(dataset, opt="LBFGS", steps=50, lamb=0.001)

model.plot()
model.auto_symbolic()
print(model.symbolic_formula())`,
    resources: [
      { label: "KAN Paper (arXiv)", url: "https://arxiv.org/abs/2404.19756", description: "Original paper: KAN: Kolmogorov-Arnold Networks", tag: "Paper" },
      { label: "pykan GitHub", url: "https://github.com/KindXiaoming/pykan", description: "Reference implementation from the MIT team", tag: "GitHub" },
      { label: "efficient-kan", url: "https://github.com/Blealtan/efficient-kan", description: "Production-grade re-implementation, 10x faster than pykan", tag: "GitHub" },
      { label: "KAN 2.0 Paper", url: "https://arxiv.org/abs/2408.10205", description: "Updated architecture with improved scaling", tag: "Paper" },
    ],
    questionBank: [
      { q: "What does KAN stand for?", options: ["Kernel Attention Network", "Kolmogorov-Arnold Networks", "Knowledge-Aware Nodes", "Keyframe Activation Network"], answer: 1 },
      { q: "Where does a KAN place its learnable activation functions, unlike an MLP?", options: ["On neurons (nodes)", "On edges (weights)", "On the input embedding", "On the loss function"], answer: 1 },
      { q: "What type of functions are used as learnable activations in KANs?", options: ["ReLU variants", "Fourier series", "B-splines", "Sigmoid curves"], answer: 2 },
      { q: "What are the control points in a B-spline called?", options: ["Anchors", "Nodes", "Knots", "Pivots"], answer: 2 },
      { q: "On which task type do KANs typically outperform MLPs?", options: ["High-dimensional image classification", "Large-scale language modeling", "Low-dimensional scientific and symbolic regression tasks", "Video generation"], answer: 2 },
      { q: "What unique capability does a trained KAN have that MLPs lack?", options: ["It can process audio natively", "It can reveal the learned mathematical formula via symbolic extraction", "It trains without backpropagation", "It requires no GPU"], answer: 1 },
      { q: "What does `model.auto_symbolic()` attempt to do?", options: ["Convert the model to ONNX", "Recover an exact symbolic mathematical expression from the learned splines", "Prune all edges below a threshold", "Export spline weights to CSV"], answer: 1 },
      { q: "What mathematical theorem underpins the KAN architecture?", options: ["Universal Approximation Theorem", "Kolmogorov-Arnold Representation Theorem", "Bayes Theorem", "Nyquist-Shannon Sampling Theorem"], answer: 1 },
      { q: "What is efficient-kan relative to pykan?", options: ["A smaller model with fewer parameters", "A faster, production-grade reimplementation", "A web interface for pykan", "A cloud-hosted version"], answer: 1 },
      { q: "Why are KANs more interpretable than MLPs?", options: ["They have fewer parameters", "Each edge's activation can be visualized and simplified to a formula", "They use integer arithmetic", "Their weights are always positive"], answer: 1 },
      { q: "Where do MLPs still outperform KANs?", options: ["Physics simulations", "Symbolic regression", "High-dimensional perception tasks like vision and language", "Protein folding with small datasets"], answer: 2 },
      { q: "Which university lab published the original KAN paper?", options: ["Stanford AI Lab", "Berkeley AI Research", "MIT", "Carnegie Mellon"], answer: 2 },
      { q: "What does the `lamb` parameter control in `model.train()`?", options: ["Learning rate", "Regularization — prunes low-importance edges", "Spline grid resolution", "Number of training steps"], answer: 1 },
      { q: "What does the `grid` parameter in KAN() control?", options: ["Number of hidden layers", "Number of grid intervals for each B-spline function", "The learning rate schedule", "Number of output classes"], answer: 1 },
      { q: "What does `k=3` specify in the KAN constructor?", options: ["Number of training epochs", "The spline polynomial order (cubic)", "Number of hidden nodes", "Rank of weight matrices"], answer: 1 },
      { q: "What optimizer is LBFGS and why is it preferred for KAN training?", options: ["A first-order adaptive optimizer; fast for large datasets", "A second-order optimizer well-suited to smooth, low-dimensional function fitting", "A gradient-free optimizer", "A stochastic optimizer with momentum"], answer: 1 },
      { q: "What does `model.prune()` do after regularized training?", options: ["Deletes the model", "Removes edges with near-zero activation, simplifying the network structure", "Restores pruned edges", "Re-initializes all weights"], answer: 1 },
      { q: "What is grid refinement in the context of KAN training?", options: ["Increasing the dataset size", "Transferring learned weights to a finer spline grid, then continuing training", "Adding more hidden nodes", "Switching from LBFGS to Adam"], answer: 1 },
      { q: "What does a higher `k` value (e.g., k=5) give you compared to k=1?", options: ["Fewer trainable parameters", "Higher-degree polynomial splines — smoother but more complex activation shapes", "Faster training", "Smaller output range"], answer: 1 },
      { q: "What is the main practical limitation of pykan for production use?", options: ["pykan only works on CPU", "pykan is research-quality and significantly slower than efficient-kan", "pykan requires a paid license", "pykan does not support symbolic simplification"], answer: 1 },
      {
        q: "What architecture does `KAN(width=[2, 5, 1])` define?",
        code: `from kan import KAN
model = KAN(width=[2, 5, 1], grid=5, k=3)`,
        options: ["2 layers with 5 total neurons", "Input layer of 2, hidden layer of 5, output layer of 1", "5 layers with 2 inputs and 1 output", "A 2x5 weight matrix with 1 bias"],
        answer: 1
      },
      {
        q: "What does this target function compute?",
        code: `def target(x):
    return torch.exp(torch.sin(torch.pi * x[:, 0]) + x[:, 1] ** 2)`,
        options: ["exp(sin(x0) + x1^2)", "exp(sin(pi * x0) + x1^2)", "sin(exp(pi * x0)) + x1^2", "pi * sin(x0) + exp(x1^2)"],
        answer: 1
      },
      {
        q: "What input range does the training data cover?",
        code: `x_train = torch.rand(1000, 2) * 2 - 1`,
        options: ["[0, 1]", "[0, 2]", "[-1, 1]", "[-2, 2]"],
        answer: 2
      },
      {
        q: "What does `model.plot()` display after training?",
        code: `model.train(dataset, opt="LBFGS", steps=50)
model.plot()`,
        options: ["A loss curve over training steps", "A visualization of the learned activation function on each edge", "A confusion matrix", "A histogram of weight magnitudes"],
        answer: 1
      },
      {
        q: "What does this code attempt to output?",
        code: `model.auto_symbolic()
formula = model.symbolic_formula()
print(formula)`,
        options: ["The model training loss", "A human-readable mathematical formula extracted from the learned splines", "The model architecture as a string", "The total parameter count"],
        answer: 1
      },
      {
        q: "What does increasing `grid` from 3 to 10 do?",
        code: `model_coarse = KAN(width=[2, 3, 1], grid=3, k=3)
model_fine   = KAN(width=[2, 3, 1], grid=10, k=3)`,
        options: ["model_fine has more hidden nodes", "model_fine can fit more complex activation shapes with more spline intervals", "model_fine trains faster", "model_fine uses less memory"],
        answer: 1
      },
      {
        q: "What does `lamb=0.01` versus `lamb=0.0` do?",
        code: `results_reg  = model.train(dataset, opt="LBFGS", steps=50, lamb=0.01)
results_none = model.train(dataset, opt="LBFGS", steps=50, lamb=0.0)`,
        options: ["lamb=0.01 trains 10x faster", "lamb=0.01 applies L1 regularization that prunes weak edges; lamb=0.0 applies no regularization", "lamb=0.01 uses 10 steps per iteration", "There is no difference"],
        answer: 1
      },
      {
        q: "What does this auto_symbolic call do?",
        code: `model.auto_symbolic(lib=["x", "x^2", "sin", "exp", "log"])`,
        options: ["Converts each learned spline to the closest symbolic function from the provided library", "Exports the model to a symbolic math library", "Runs 5 more training steps", "Plots each activation"],
        answer: 0
      },
      {
        q: "What does this comparison tell you about parameter efficiency?",
        code: `kan_params = sum(p.numel() for p in kan_model.parameters())
mlp_params = sum(p.numel() for p in mlp_model.parameters())
print(f"KAN: {kan_params}, MLP: {mlp_params}")
# Output: KAN: 580, MLP: 5200`,
        options: ["The MLP is more accurate because it has more parameters", "The KAN achieves comparable performance with ~9x fewer parameters on this scientific task", "The KAN will always outperform the MLP", "The parameter counts are incorrect"],
        answer: 1
      },
      {
        q: "How many input features does this KAN expect?",
        code: `x_train = torch.rand(500, 3)
y_train = x_train[:, 0] ** 2 + torch.sin(x_train[:, 1]) - x_train[:, 2]
model = KAN(width=[3, 5, 1], grid=5, k=3)`,
        options: ["1", "2", "3", "5"],
        answer: 2
      },
      {
        q: "What does this grid refinement sequence do?",
        code: `model = KAN(width=[2, 5, 1], grid=3, k=3)
model.train(dataset, opt="LBFGS", steps=50)
model = model.refine(grid=10)
model.train(dataset, opt="LBFGS", steps=50)`,
        options: ["Resets and trains from scratch with grid=10", "Transfers learned weights to a finer grid, then continues training with more expressive splines", "Increases hidden nodes from 5 to 10", "Changes the spline order from 3 to 10"],
        answer: 1
      },
      {
        q: "What does this MSE test measure?",
        code: `x_test = torch.linspace(-1, 1, 100).unsqueeze(1)
y_pred = model(x_test)
y_true = torch.sin(torch.pi * x_test)
mse = torch.mean((y_pred - y_true) ** 2)
print(f"Test MSE: {mse.item():.6f}")`,
        options: ["Training loss on the training set", "Mean Squared Error between model predictions and a sine function on a test grid", "The model parameter count", "The B-spline knot positions"],
        answer: 1
      },
      {
        q: "What is wrong with this KAN definition for a 1D input / 1D output task?",
        code: `model = KAN(width=[2, 5, 1], grid=5, k=3)
x = torch.rand(100, 1)
y = model(x)`,
        options: ["grid=5 is too large", "width=[2,5,1] expects 2 input features but x has only 1 — should be KAN(width=[1,5,1],...)", "k=3 is invalid for 1D tasks", "KAN cannot have a single output node"],
        answer: 1
      },
      {
        q: "What problem does this dataset dict have?",
        code: `dataset = {
    "train_input": x_train,
    "train_label": y_train,
}
results = model.train(dataset, opt="LBFGS", steps=50)`,
        options: ["steps=50 is too few", "The dataset dict is missing 'test_input' and 'test_label' keys which pykan expects", "LBFGS cannot be used without a test set", "x_train must be a numpy array"],
        answer: 1
      },
      {
        q: "What is `k=1` versus `k=3`?",
        code: `model_linear = KAN(width=[2, 4, 1], grid=5, k=1)
model_cubic  = KAN(width=[2, 4, 1], grid=5, k=3)`,
        options: ["model_linear trains faster and uses piecewise-linear activations; model_cubic uses piecewise-cubic smoother activations", "model_linear is more accurate", "k controls the number of layers", "model_cubic trains faster"],
        answer: 0
      },
      {
        q: "What is the shape of the test input in this dataset?",
        code: `dataset = {
    "train_input": torch.rand(800, 2),
    "train_label": torch.rand(800, 1),
    "test_input":  torch.rand(200, 2),
    "test_label":  torch.rand(200, 1),
}`,
        options: ["(800, 2)", "(200, 1)", "(200, 2)", "(1, 200)"],
        answer: 2
      },
      {
        q: "What is the likely cause if `model.symbolic_formula()` returns None?",
        code: `model.train(dataset, opt="LBFGS", steps=20, lamb=0.0)
formula = model.symbolic_formula()  # returns None`,
        options: ["steps=20 is too many", "lamb=0.0 means no regularization — edges not pruned and auto_symbolic not called first", "The model architecture is too complex", "LBFGS does not support symbolic extraction"],
        answer: 1
      },
      {
        q: "What is wrong with this architecture for fitting a 2D scientific function?",
        code: `import torch.nn as nn
mlp = nn.Sequential(
    nn.Linear(2, 512),
    nn.ReLU(),
    nn.Linear(512, 512),
    nn.ReLU(),
    nn.Linear(512, 1)
)`,
        options: ["Nothing is wrong", "For a low-dimensional scientific function where interpretability matters, a KAN with far fewer parameters would be better suited", "MLPs cannot take 2D inputs", "The output layer should have 2 nodes"],
        answer: 1
      },
      {
        q: "What does this comparison show about KAN vs MLP task suitability?",
        code: `# Task A: predict protein binding energy from 4 molecular descriptors
# Task B: classify 224x224 images into 1000 classes

# KAN:  Task A MSE = 0.003,  Task B accuracy = 42%
# MLP:  Task A MSE = 0.004,  Task B accuracy = 71%`,
        options: ["KAN is strictly better than MLP", "KAN is better for the low-dimensional scientific task; MLP is better for high-dimensional perception", "MLP is always better for both", "The results are equivalent"],
        answer: 1
      },
      {
        q: "What does `torch.rand(1000, 2) * 2 - 1` produce vs `torch.rand(1000, 2)`?",
        code: `x_centered   = torch.rand(1000, 2) * 2 - 1
x_uncentered = torch.rand(1000, 2)`,
        options: ["x_centered is in [-1, 1]; x_uncentered is in [0, 1]", "x_centered is in [0, 2]; x_uncentered is in [-1, 0]", "They produce the same values", "x_centered has 2x more samples"],
        answer: 0
      },
    ],
  },

  "voice-ai-agent-pipeline": {
    slug: "voice-ai-agent-pipeline", type: "Startup Integration",
    title: "Voice AI Agent Pipeline Engineering",
    tagline: "Build sub-200ms speech-to-speech agents that replace legacy IVR",
    signal: "Low-latency WebSocket voice bots are replacing legacy IVR telephone systems at scale.",
    signalDelta: "Very High", time: "30 minutes", difficulty: "Intermediate",
    impact: "Very High", adopters: ["Retell AI", "Vapi", "Bland AI"],
    overview: "A voice AI pipeline chains three real-time components: Speech-to-Text (STT) converts audio to text, an LLM generates a response, and Text-to-Speech (TTS) converts the response back to audio. The entire round-trip must complete in under 200ms to feel natural. This is done over WebSockets with streaming at each stage.",
    whyNow: "ElevenLabs, Deepgram, and AssemblyAI have driven STT/TTS latency to under 50ms each. Vapi and Retell provide hosted orchestration layers that handle WebSocket lifecycle, interruption detection, and turn-taking. Companies are replacing inbound call centers with voice agents that cost pennies per call.",
    concepts: [
      { title: "Streaming at Every Stage", body: "Never buffer a full sentence. Deepgram sends partial transcripts as the user speaks. The LLM streams token-by-token output. ElevenLabs begins synthesizing audio before it receives the full sentence. Each stage starts consuming the previous stage's output the moment the first chunk arrives." },
      { title: "Interruption Handling (Barge-in)", body: "When the user speaks mid-response, the pipeline must stop TTS playback, discard the LLM generation in progress, and process the new user input immediately." },
      { title: "Turn Detection", body: "Knowing when a user has finished speaking uses VAD (Voice Activity Detection) plus a configurable silence threshold. Too aggressive: cuts users off. Too conservative: awkward silence." },
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
            model="eleven_turbo_v2",
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
      { q: "What is 'barge-in' in a voice pipeline?", options: ["The initial connection handshake", "When the user speaks while the bot is still responding", "A fallback when STT fails", "The bot greeting message"], answer: 1 },
      { q: "What must happen immediately when barge-in is detected?", options: ["Restart the WebSocket", "Increase TTS speed", "Stop TTS playback and cancel the in-flight LLM generation", "Switch to a different STT provider"], answer: 2 },
      { q: "What is the key principle of streaming in a voice pipeline?", options: ["Wait for a full sentence before starting the next stage", "Each stage starts processing as soon as the first chunk from the previous stage arrives", "Buffer audio in 1-second windows", "Only stream TTS, not STT"], answer: 1 },
      { q: "What does end-point detection determine?", options: ["When the WebSocket drops", "When to switch LLM providers", "When the user has finished speaking", "When TTS audio is fully buffered"], answer: 2 },
      { q: "What is the consequence of too-aggressive end-point detection?", options: ["Higher latency", "The bot cuts users off mid-sentence", "TTS audio becomes choppy", "The LLM generates longer responses"], answer: 1 },
      { q: "What protocol streams real-time audio between pipeline stages?", options: ["HTTP long-polling", "gRPC streaming", "WebSocket", "MQTT"], answer: 2 },
      { q: "What is a primary advantage of Vapi or Retell over a raw pipeline?", options: ["They provide free LLM credits", "They handle WebSocket lifecycle, barge-in, and turn-taking automatically", "They have lower STT latency than Deepgram", "They work without internet"], answer: 1 },
      { q: "What challenge is specific to phone (telephony) voice AI vs browser-based?", options: ["Phone audio has lower quality, more noise, and narrower frequency range", "Phone calls cannot use WebSocket", "Phone microphones do not support streaming", "Phone audio cannot be transcribed"], answer: 0 },
      { q: "What does the silence threshold in VAD control?", options: ["How loud the user must speak", "How long to wait after last detected speech before marking end-of-turn", "The minimum audio chunk size", "The maximum recording duration"], answer: 1 },
      { q: "What does `punctuate=True` do in `LiveOptions`?", options: ["Adds punctuation marks to transcription output", "Enables speaker diarization", "Activates noise reduction", "Forces lowercase output"], answer: 0 },
      { q: "Why is buffering a full sentence before TTS harmful?", options: ["It increases token costs", "It adds hundreds of milliseconds of latency making conversation feel unnatural", "TTS models reject long inputs", "It prevents barge-in detection"], answer: 1 },
      { q: "Which ElevenLabs model is used in the lesson code for lowest latency?", options: ["eleven_monolingual_v1", "eleven_multilingual_v2", "eleven_turbo_v2", "eleven_flash_v3"], answer: 2 },
      { q: "What does `result.is_final` check in a Deepgram transcript event?", options: ["Whether the audio stream ended", "Whether this is a final (complete) transcript, not a partial one", "Whether the LLM finished generating", "Whether the user pressed a button"], answer: 1 },
      { q: "What does `AsyncOpenAI` provide over regular `OpenAI`?", options: ["A newer version of the SDK", "Async/await compatible methods so the pipeline does not block waiting for LLM tokens", "AsyncOpenAI is faster but less reliable", "There is no difference"], answer: 1 },
      { q: "What does `el_stream(audio)` do?", options: ["Saves audio to a .mp3 file", "Plays audio chunks in real-time as they stream from the ElevenLabs API", "Encodes audio to base64", "Uploads audio to a CDN"], answer: 1 },
      { q: "What is end-to-end latency composed of in a voice pipeline?", options: ["STT latency only", "STT + LLM first-token latency + TTS first-audio latency", "Only network round-trip time", "TTS latency only"], answer: 1 },
      { q: "What does `LiveOptions(model='nova-2')` configure?", options: ["An OpenAI model", "The Deepgram STT model to use for transcription", "The ElevenLabs voice model", "The LLM used for response generation"], answer: 1 },
      {
        q: "What does `result.is_final` guard against in this handler?",
        code: `async def on_transcript(_, result, **__):
    text = result.channel.alternatives[0].transcript
    if result.is_final and text:
        await respond(text)`,
        options: ["It prevents duplicate API calls", "It ensures we only process final transcripts, ignoring partial mid-speech results", "It checks if the audio file is fully uploaded", "It validates the text is non-empty only"],
        answer: 1
      },
      {
        q: "What does `chunk.choices[0].delta.content or ''` handle?",
        code: `async for chunk in await oai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[...],
    stream=True,
):
    chunks.append(chunk.choices[0].delta.content or "")`,
        options: ["Converts None to empty string when the chunk has no text (e.g. role chunk at start)", "Selects the highest-scoring completion", "Handles rate limit errors", "Filters profanity"],
        answer: 0
      },
      {
        q: "Why does `respond()` collect all LLM chunks before calling ElevenLabs?",
        code: `async def respond(user_text: str):
    chunks = []
    async for chunk in await oai.chat.completions.create(..., stream=True):
        chunks.append(chunk.choices[0].delta.content or "")
    audio = el.generate(text="".join(chunks), ...)
    el_stream(audio)`,
        options: ["OpenAI streaming requires collecting all chunks", "ElevenLabs generate() requires complete text before it can start synthesizing", "To reduce API calls to ElevenLabs", "Streaming partial text would produce garbled audio"],
        answer: 1
      },
      {
        q: "What does `connection.on(LiveTranscriptionEvents.Transcript, on_transcript)` do?",
        code: `connection = dg.listen.asyncwebsocket.v("1")
connection.on(LiveTranscriptionEvents.Transcript, on_transcript)
await connection.start(LiveOptions(model="nova-2", punctuate=True))`,
        options: ["Sends a transcript to Deepgram", "Registers a callback that fires whenever Deepgram sends a transcript event", "Starts recording audio from the microphone", "Configures the STT model"],
        answer: 1
      },
      {
        q: "What does this loop do?",
        code: `async for chunk in audio_stream:
    await connection.send(chunk)`,
        options: ["Reads audio from a file and plays it", "Streams raw audio bytes from an input source to the Deepgram WebSocket in real-time", "Processes already-transcribed text", "Sends TTS audio back to the user"],
        answer: 1
      },
      {
        q: "What does `LiveOptions(model='nova-2', punctuate=True)` configure?",
        code: `await connection.start(LiveOptions(model="nova-2", punctuate=True))`,
        options: ["Selects the Deepgram nova-2 STT model and enables punctuation in transcripts", "Starts a new conversation session with OpenAI", "Configures ElevenLabs voice quality", "Sets the WebSocket connection timeout"],
        answer: 0
      },
      {
        q: "What does this barge-in handler need to do that the lesson code doesn't show?",
        code: `async def on_transcript(_, result, **__):
    text = result.channel.alternatives[0].transcript
    if result.is_final and text:
        # Bot might still be speaking here!
        await respond(text)`,
        options: ["Check if text is non-empty", "Cancel any in-flight TTS playback and LLM generation before calling respond()", "Wait for TTS to finish before transcribing", "Use synchronous calls"],
        answer: 1
      },
      {
        q: "What does `endpointing=300` configure in Deepgram?",
        code: `options = LiveOptions(
    model="nova-2",
    punctuate=True,
    endpointing=300
)`,
        options: ["The maximum recording duration in seconds", "Wait 300ms of silence after last detected speech before emitting a final transcript", "The audio sample rate in Hz", "The connection timeout in milliseconds"],
        answer: 1
      },
      {
        q: "What does this asyncio pattern ensure?",
        code: `async def main():
    stt_task = asyncio.create_task(run_stt())
    tts_task = asyncio.create_task(run_tts())
    await asyncio.gather(stt_task, tts_task)`,
        options: ["stt_task runs first, then tts_task", "Both tasks run concurrently in the same event loop", "The tasks run in separate threads", "The tasks share a single WebSocket connection"],
        answer: 1
      },
      {
        q: "What is the latency problem with this pipeline design?",
        code: `def respond(user_text: str):
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_text}],
        stream=False
    )
    text = response.choices[0].message.content
    audio_bytes = elevenlabs.generate(text=text, stream=False)
    play(audio_bytes)`,
        options: ["Nothing is wrong", "Both LLM and TTS are non-streaming, adding 1-3 seconds of latency before any audio plays", "OpenAI does not support gpt-4o for voice", "elevenlabs.generate is deprecated"],
        answer: 1
      },
      {
        q: "What happens if `result.is_final` is removed from this check?",
        code: `async def on_transcript(_, result, **__):
    text = result.channel.alternatives[0].transcript
    if text:  # is_final removed
        await respond(text)`,
        options: ["Nothing changes", "respond() is called for every partial transcript as the user speaks, causing duplicate LLM calls mid-sentence", "Transcription stops working", "The pipeline processes only final results"],
        answer: 1
      },
      {
        q: "What is missing from this pipeline that would cause it to miss all user speech?",
        code: `connection = dg.listen.asyncwebsocket.v("1")
await connection.start(LiveOptions(model="nova-2"))
# Connects, but never feeds audio
response = await oai.chat.completions.create(...)`,
        options: ["LiveOptions is misconfigured", "Audio is never sent to the Deepgram WebSocket — the audio streaming loop is missing", "OpenAI is called before Deepgram", "The connection needs to be closed first"],
        answer: 1
      },
      {
        q: "What problem does this endpointing value cause?",
        code: `options = LiveOptions(
    model="nova-2",
    endpointing=3000
)`,
        options: ["3000ms is too fast and causes barge-in", "Waiting 3 seconds after silence creates unacceptably long pauses in conversation", "endpointing must be in seconds, not milliseconds", "nova-2 does not support endpointing"],
        answer: 1
      },
      {
        q: "What race condition does this code have?",
        code: `current_task = None

async def on_transcript(_, result, **__):
    global current_task
    if result.is_final and result.channel.alternatives[0].transcript:
        current_task = asyncio.create_task(respond(text))`,
        options: ["Nothing — this correctly handles barge-in", "The previous current_task is never cancelled, so two respond() calls run simultaneously", "asyncio.create_task cannot be used inside a callback", "result.is_final is not a valid attribute"],
        answer: 1
      },
      {
        q: "What does `model='eleven_turbo_v2'` optimize for compared to standard ElevenLabs models?",
        code: `audio = el.generate(
    text=response_text,
    voice="Rachel",
    model="eleven_turbo_v2",
    stream=True
)`,
        options: ["Higher audio quality at the cost of more latency", "Lowest latency TTS output, optimized for real-time voice agents", "Multilingual support", "Lower cost per character"],
        answer: 1
      },
      {
        q: "What does `smart_format=True` add to Deepgram transcriptions?",
        code: `options = LiveOptions(
    model="nova-2",
    punctuate=True,
    smart_format=True,
    language="en-US"
)`,
        options: ["Detects the language automatically", "Formats numbers, dates, and currency in human-readable form", "Enables speaker diarization", "Reduces transcription latency"],
        answer: 1
      },
      {
        q: "What does this barge-in flag implementation do?",
        code: `is_speaking = False

async def play_audio(audio_gen):
    global is_speaking
    is_speaking = True
    for chunk in audio_gen:
        if not is_speaking:
            break
        speaker.write(chunk)
    is_speaking = False

async def on_barge_in():
    global is_speaking
    is_speaking = False`,
        options: ["Increases the audio volume on barge-in", "Sets is_speaking=False to stop mid-playback when user speaks, implementing barge-in", "Restarts the TTS generation", "Logs the interruption event"],
        answer: 1
      },
      {
        q: "What does this Vapi webhook handler respond with?",
        code: `@app.post("/vapi-webhook")
async def vapi_handler(request: Request):
    body = await request.json()
    if body["type"] == "assistant-request":
        return {"assistant": {"firstMessage": "Hello, how can I help?"}}`,
        options: ["Audio binary data", "A JSON config telling Vapi what assistant to use and its opening message", "A transcription of the caller's speech", "ElevenLabs audio chunks"],
        answer: 1
      },
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
    const picked = shuffle(lesson.questionBank).slice(0, QUIZ_SIZE);
    setQuizQuestions(picked);
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

          <div className="bg-goldAccent/[0.03] border border-goldAccent/20 rounded-2xl px-6 py-5 flex items-start gap-4">
            <span className="text-2xl font-extrabold text-goldAccent shrink-0">{lesson.signalDelta}</span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-goldAccent block mb-1">Traction Signal</span>
              <p className="text-sm text-textSecondary leading-relaxed">{lesson.signal}</p>
            </div>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-display font-extrabold text-white">What is it?</h2>
            <p className="text-sm text-textSecondary leading-relaxed">{lesson.overview}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-display font-extrabold text-white">Why now?</h2>
            <p className="text-sm text-textSecondary leading-relaxed">{lesson.whyNow}</p>
          </section>

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
                  {QUIZ_SIZE} questions randomly selected per attempt · Pass with {Math.round(PASS_THRESHOLD * 100)}%+ · {lesson.questionBank.length} questions in bank
                </p>
              </div>
              {quizState === "idle" && (
                <button onClick={() => setQuizState("naming")}
                  className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all shrink-0">
                  Start Assessment
                </button>
              )}
            </div>

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
                  <p className="text-base font-bold text-white leading-snug mb-4">{q.q}</p>
                  {q.code && (
                    <pre className="bg-[#080F1A] border border-white/[0.07] rounded-xl px-4 py-4 mb-5 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed">
                      <code>{q.code}</code>
                    </pre>
                  )}
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
                        : `You scored ${pct}%. You need ${Math.round(PASS_THRESHOLD * 100)}% to pass. Questions are randomised each attempt — keep studying and try again.`}
                    </p>
                    {!passed && (
                      <button onClick={() => setQuizState("naming")}
                        className="mt-3 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all">
                        Retake Assessment
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Question Review</p>
                  {quizQuestions.map((qq, i) => {
                    const correct = answers[i] === qq.answer;
                    return (
                      <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs ${correct ? "border-tealAccent/15 bg-tealAccent/[0.02]" : "border-red-400/15 bg-red-400/[0.02]"}`}>
                        <span className={`mt-0.5 shrink-0 font-extrabold ${correct ? "text-tealAccent" : "text-red-400"}`}>{correct ? "✓" : "✗"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{qq.q}</p>
                          {qq.code && (
                            <pre className="mt-1 bg-[#080F1A] rounded-lg px-3 py-2 text-[10px] font-mono text-zinc-400 overflow-x-auto max-h-24">
                              <code>{qq.code}</code>
                            </pre>
                          )}
                          {!correct && (
                            <p className="text-zinc-400 mt-0.5">Correct answer: <span className="text-tealAccent">{qq.options[qq.answer]}</span></p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

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
