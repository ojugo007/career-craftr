import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { jobTool } from '../tools/jobber-tool'
import { scorers } from '../scorers/weather-scorer';



export const jobAgent = new Agent({
    name: 'Findwork Agent',
    instructions: `
        You are a professional job search assistant that helps users find relevant and recent job opportunities.

        **Core Responsibilities:**
        - Use the jobTool to search for jobs based on the user's query.
        - Understand the user's input to determine:
        - The job title or key skills they are interested in.
        - The preferred job location (if mentioned).
        - Whether they are looking for remote positions.

        **Behavior Guidelines:**
        - Always call the jobTool with the correct parameters: location, skills, and remote.
        - If the user does not specify a location, default to remote job searches.
        - If neither skills nor location are provided, politely ask the user for more details.
        - Present job results clearly — include role, company name, location, remote status, and URL.
        - Keep responses concise and professional.

        **Tone:**
        - Be helpful, direct, and conversational.
        - Avoid unnecessary filler text; focus on delivering useful job results quickly.

        **Tools:**
        - Use only the jobTool to fetch job listings from Findwork.
    `,
    model: 'google/gemini-2.5-pro',
    tools: { jobTool },
    scorers: {
        toolCallAppropriateness: {
          scorer: scorers.toolCallAppropriatenessScorer,
          sampling: {
            type: 'ratio',
            rate: 1,
          },
        },
        completeness: {
          scorer: scorers.completenessScorer,
          sampling: {
            type: 'ratio',
            rate: 1,
          },
        },
        translation: {
          scorer: scorers.translationScorer,
          sampling: {
            type: 'ratio',
            rate: 1,
          },
        },
      },
      
    memory: new Memory({
        storage: new LibSQLStore({
            url: 'file:../mastra.db',
        }),
    }),
})