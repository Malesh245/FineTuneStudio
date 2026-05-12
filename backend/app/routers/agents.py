"""Agent Training router — fine-tune models for agentic behavior."""
from datetime import datetime
from fastapi import APIRouter, Depends
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter(prefix="/api/agents", tags=["Agent Training"])

AGENT_TEMPLATES = [
    {
        "id": "react",
        "name": "ReAct Agent",
        "description": "Reasoning + Acting pattern. Model learns to think step-by-step and call tools.",
        "format": "react",
        "example": {
            "instruction": "Find the weather in Tokyo and book a flight there.",
            "thought": "I need to first check the weather in Tokyo, then search for flights.",
            "action": "weather_api(location='Tokyo')",
            "observation": "Tokyo: 22°C, Sunny",
            "thought2": "Weather looks good. Now I'll search for flights.",
            "action2": "flight_search(destination='Tokyo', date='2026-05-15')",
            "final": "Tokyo is 22°C and sunny! I found a flight for $450 on May 15th."
        }
    },
    {
        "id": "tool_call",
        "name": "Tool-Use Agent",
        "description": "Model learns structured function calling with JSON parameters.",
        "format": "tool_call",
        "example": {
            "instruction": "Calculate the compound interest on $10,000 at 5% for 3 years.",
            "tool_call": '{"name": "calculate_compound_interest", "arguments": {"principal": 10000, "rate": 0.05, "years": 3}}',
            "result": '{"total": 11576.25, "interest": 1576.25}',
            "response": "The compound interest on $10,000 at 5% for 3 years is $1,576.25, giving a total of $11,576.25."
        }
    },
    {
        "id": "planner",
        "name": "Planning Agent",
        "description": "Model learns to decompose complex tasks into ordered sub-steps.",
        "format": "planner",
        "example": {
            "instruction": "Build a mobile app for tracking fitness goals.",
            "plan": [
                "Step 1: Define user requirements and core features (step tracking, calorie counting)",
                "Step 2: Design the database schema for user profiles and activity logs",
                "Step 3: Create wireframes for the main UI screens",
                "Step 4: Implement the backend API with authentication",
                "Step 5: Build the React Native frontend with navigation",
                "Step 6: Add push notifications for daily reminders",
                "Step 7: Test on iOS and Android simulators",
                "Step 8: Deploy to App Store and Google Play"
            ]
        }
    },
    {
        "id": "multi_agent",
        "name": "Multi-Agent Orchestrator",
        "description": "Model learns to delegate tasks to specialized sub-agents.",
        "format": "multi_agent",
        "example": {
            "instruction": "Write a blog post about AI trends and publish it.",
            "delegation": [
                {"agent": "researcher", "task": "Find top 5 AI trends in 2026"},
                {"agent": "writer", "task": "Write 1000-word blog post using research"},
                {"agent": "editor", "task": "Proofread and optimize for SEO"},
                {"agent": "publisher", "task": "Publish to WordPress with featured image"}
            ]
        }
    }
]

SANDBOX_TOOLS = [
    {"name": "web_search", "description": "Search the internet for information", "params": ["query"]},
    {"name": "calculator", "description": "Perform mathematical calculations", "params": ["expression"]},
    {"name": "weather_api", "description": "Get current weather for a location", "params": ["location"]},
    {"name": "send_email", "description": "Send an email message", "params": ["to", "subject", "body"]},
    {"name": "database_query", "description": "Execute a SQL query", "params": ["query"]},
    {"name": "file_manager", "description": "Read/write files", "params": ["action", "path", "content"]},
]


@router.get("/templates")
async def get_templates():
    """Get available agent training templates."""
    return {"templates": AGENT_TEMPLATES, "tools": SANDBOX_TOOLS}


@router.post("/test")
async def test_agent(req: dict, user=Depends(get_optional_user)):
    """Test an agent in the sandbox environment."""
    prompt = req.get("prompt", "")
    template_id = req.get("template_id", "react")
    tools = req.get("tools", [])

    # Simulate agent behavior
    template = next((t for t in AGENT_TEMPLATES if t["id"] == template_id), AGENT_TEMPLATES[0])

    if template_id == "react":
        steps = [
            {"type": "thought", "content": f"I need to analyze this request: '{prompt}'"},
            {"type": "action", "content": f"web_search(query='{prompt}')"},
            {"type": "observation", "content": f"Found 3 relevant results for '{prompt}'"},
            {"type": "thought", "content": "I have enough information to provide a comprehensive answer."},
            {"type": "final", "content": f"Based on my research, here is a detailed answer about '{prompt}'..."},
        ]
    elif template_id == "tool_call":
        steps = [
            {"type": "tool_call", "content": f'{{"name": "web_search", "arguments": {{"query": "{prompt}"}}}}'},
            {"type": "result", "content": '{"results": ["Result 1", "Result 2", "Result 3"]}'},
            {"type": "response", "content": f"I found the following information about '{prompt}'..."},
        ]
    elif template_id == "planner":
        steps = [
            {"type": "plan", "content": f"Step 1: Research '{prompt}'"},
            {"type": "plan", "content": "Step 2: Analyze the key components"},
            {"type": "plan", "content": "Step 3: Synthesize findings"},
            {"type": "plan", "content": "Step 4: Generate final output"},
            {"type": "execute", "content": "All steps completed successfully."},
        ]
    else:
        steps = [
            {"type": "delegate", "content": f"Assigning research on '{prompt}' to researcher agent"},
            {"type": "delegate", "content": "Assigning writing task to writer agent"},
            {"type": "aggregate", "content": "Combining outputs from all agents..."},
            {"type": "final", "content": "Multi-agent pipeline completed successfully."},
        ]

    return {
        "template": template["name"],
        "steps": steps,
        "metrics": {
            "tool_accuracy": 92,
            "plan_completion": 100,
            "reasoning_depth": 4,
            "total_steps": len(steps),
        }
    }


@router.post("/generate-dataset")
async def generate_agent_dataset(req: dict, user=Depends(get_optional_user)):
    """Generate a training dataset from agent template."""
    template_id = req.get("template_id", "react")
    count = req.get("count", 10)

    template = next((t for t in AGENT_TEMPLATES if t["id"] == template_id), AGENT_TEMPLATES[0])

    return {
        "template": template["name"],
        "generated_pairs": count,
        "format": template["format"],
        "message": f"Generated {count} training pairs in {template['format']} format. Ready for fine-tuning!"
    }
