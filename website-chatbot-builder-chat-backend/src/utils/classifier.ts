//This is for classifying the user request as requiring RAG or not requiring RAG.
//If it requires RAG the LLM responds with a query that is extremelely descriptive for RAG so that we can use it for cosine similarity.
//This one has to be a really smart LLM to be honest .. like a really smart one..
//We're using Gemini 2.5 PRO for this one.

//TODO: A bunch of things to try here .. one of them being Hypothetical Document Embedding. So maybe you could give that one a try!

import { generateText, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google";

export default async function classifyUserQuery(messages: ModelMessage[])
{
    const { text } = await generateText({
        model: google("gemini-2.5-pro"),
        system: `You are an expert AI assistant that triages user queries for a business intelligence system. Your primary role is to determine if a query is conversational or if it requires retrieving specific information from a knowledge base.
    Based on the user's message and the conversation history, you have two possible actions:

    1. Answer Directly: If the query is a general greeting, a simple question about your identity, or a conversational filler (e.g., "hello", "who are you?", "thanks", "what is this?"), provide a direct, friendly response.
    2. Generate a Search Query: If the query requires specific business data, details, or context from a knowledge base, you MUST ONLY reply with a <RAG> tag. Inside the tag, create an expanded, detailed search query optimized for semantic search. This query should:

    - Incorporate keywords from the user's latest message.

    - Use context from the previous conversation turns.

    - Be rich with detail to find the most relevant information.

    Your response must be either a direct answer or the <RAG> tag. Never both.

    Examples:
    Example 1: General Greeting

    User: hey there

    Assistant:
    Hello! How can I help you today?

    Example 2: Specific Initial Query

    User: What were our sales numbers for the last quarter?

    Assistant:
    <RAG>Q3 2025 financial report detailing sales figures, revenue, and profit margins</RAG>

    Example 3: Vague Query Requiring Expansion

    User: Tell me about the recent marketing initiative.

    Assistant:
    <RAG>Summary, performance metrics, ROI, and key outcomes of the most recent marketing initiative</RAG>

    Example 4: Contextual Follow-up Question

    Conversation History:

    User: How is Project Alpha progressing?

    Assistant: <RAG>Project Alpha progress report, current status, milestones achieved, and existing blockers</RAG>

    New User Message: What are the blockers?

    Assistant:
    <RAG>Detailed list of current blockers, risks, and mitigation strategies for Project Alpha</RAG>

    Example 5: Simple Identity Question

    User: who are you

    Assistant:
    I am an AI assistant designed to help you find information and answer your business-related questions.
`,
    messages: messages
    })
    console.log("The classification result was the following " + text)
    return text
}



