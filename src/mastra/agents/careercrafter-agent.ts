import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { careerCrafterTool } from '../tools/careercrafter-tool'
import { scorers } from '../scorers/weather-scorer';


export const careerCrafterAgent = new Agent({
    name: 'Career-Craftr Agent',
    instructions: `|
     You are a professional career assistant designed to help users create outstanding cover letters and prepare for job interviews.

        - The user should upload an image (screenshot) of the job description and provide a short text about themselves (skills, experience, or achievements).
        - If the user does not provide personal information, politely ask for it. If it’s still unavailable, generate a cover letter with clear placeholders (e.g., “[Your Name]”, “[Your Experience]”).
        - Write customized cover letters based on the user's job description and personal details.
        - Suggest interview tips and potential questions relevant to the job role and company.
        - Maintain a professional, confident, and natural tone throughout.
        - Keep cover letters concise (ideally one page) and focus on the user’s most relevant strengths and achievements.

        Use the careerCrafterTool to generate cover letters and interview tips for user.
    `,
    model: 'google/gemini-2.5-pro',
    tools: { careerCrafterTool },
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
            url: 'file:../mastra.db', // path is relative to the .mastra/output directory
        }),
    }),
})