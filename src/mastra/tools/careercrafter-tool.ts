import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios'
import 'dotenv/config'

interface OCRResponse {
    ParsedResults: {
        TextOverlay?: {
            Lines: any[];
            HasOverlay: boolean;
            Message: string;
        };
        TextOrientation: string;
        FileParseExitCode: number;
        ParsedText: string;
        ErrorMessage: string;
        ErrorDetails: string;
    }[];
    OCRExitCode: number;
    IsErroredOnProcessing: boolean;
    ProcessingTimeInMilliseconds: string;
    SearchablePDFURL: string;
}

export const careerCrafterTool = createTool({
    id: "career-crafter",
    description: "Generate a personalized cover letter and interview tips from a job description image and user details.",

    inputSchema: z.object({
        jobImage: z.string().url().describe("URL of the job description image provided by Telex."),

        userInfo: z.string().describe("Text describing the user's skills, experience, and background."),
    }),

    outputSchema: z.object({
        coverLetter: z.string().describe("Generated personalized cover letter."),

        interviewTips: z.array(z.string()).describe("Interview preparation tips and suggested questions."),
  }),

    execute: async ({ input }) => {
    const { jobImage, userInfo } = input;

    // extract text from image using OCR.Space
    const response = await axios.post(
      "https://api.ocr.space/parse/imageurl",
      null,
      {
        params: {
          apikey: process.env.OCR_APIKEY!,
          url: jobImage,
          language: "eng",
        },
      }
    );

    if (response.data.IsErroredOnProcessing) {
      throw new Error('OCR processing failed: ' + (response.data.ErrorMessage || 'Unknown error'));
    }

    const parsedText = response.data.ParsedResults?.[0]?.ParsedText || "";

    // generate the cover letter and interview tips using gemini AI
    const coverLetter = await generateCoverLetter(parsedText, userInfo);

    const interviewTips = await generateInterviewTips(parsedText);

    return {
      coverLetter,
      interviewTips,
    };
  },
});

async function generateCoverLetter(job_desc:string, user_info:string): Promise<string>{
    const prompt = `
        Job Description:
        ${job_desc}

        User Information:
        ${user_info}

        Write a professional, one-page cover letter that highlights the user's most relevant skills and experiences for this role.
        Keep the tone confident and tailored to the job description.
    `;

  // In real usage, replace this with an actual LLM call (e.g., Mastra's model.run())
    return "Dear Hiring Manager,\n\nBased on your job post, I believe my background aligns perfectly with your needs...";
}
async function generateInterviewTips(job_desc:string) {
    const prompt = `
        Based on the following job description:
        ${job_desc}

        Suggest 3 to 5 interview questions or preparation tips relevant to this role.
    `;

    return [
        "Research common WordPress development interview questions.",
        "Be ready to discuss your approach to plugin development and optimization.",
        "Prepare examples of past projects showcasing front-end and back-end skills.",
    ];
}

