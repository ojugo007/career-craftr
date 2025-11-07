import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import 'dotenv/config';

interface JobResponse {
    count: number,
    results: {
        role: string,
        company_name: string,
        company_num_employees: number | string | null,
        employment_type: string | null,
        location: string,
        remote: boolean,
        url: string,
        text: string
    }[]
}

export const jobTool = createTool({
    id: 'get-job',
    description: 'Search for jobs by location, skill, and remote status using the Findwork API.',
    inputSchema: z.object({
        location: z.string().describe('City name'),
        skills: z.string().describe('list of technical skills'),
        remote: z.boolean()
    }),
    outputSchema: z.object({
        count: z.number(),
        results: z.array(
            z.object({
                role: z.string(),
                company_name: z.string(),
                company_num_employees: z.union([z.number(), z.string(), z.null()]),
                employment_type: z.string().nullable(),
                location: z.string(),
                remote: z.boolean(),
                url: z.url(),
                text: z.string(),
            })
        ),
    }),

    execute: async ({ context }) => {
        return await getJobs(context.location, context.skills, context.remote);
    },

})

async function getJobs(location: string, skills: string, remote: boolean) {
    const baseUrl = 'https://findwork.dev/api/jobs';
    const params = new URLSearchParams();

    if (skills) params.append('search', skills);
    if (location) params.append('location', location);
    if (remote) params.append('remote', 'true');

    const url = `${baseUrl}/?${params.toString()}`;

    const apikey = process.env.FINDWORK_API_KEY
    if(!apikey){
        console.log(apikey)
        throw new Error("Missing FINDWORK_API_KEY environment variable")
    }

    const jobResponse = await fetch(url, {
        method: 'GET',
        headers:{
            Authorization : 'Token 895ec41fd1bf0be913f64c8ccf6292f33a08f412',
            'Content-Type' : 'application/json'
        }
    })
    if (!jobResponse.ok) {
        throw new Error(`Error fetching jobs: ${jobResponse.statusText}`);
    }

    const jobData = (await jobResponse.json()) as JobResponse;

    return {
        count: jobData?.count?? 0,
        results: (jobData.results ?? []).map(result =>({
            role: result.role,
            company_name: result.company_name,
            company_num_employees: result.company_num_employees,
            employment_type: result.employment_type,
            location: result.location,
            remote: result.remote,
            url: result.url,
            text: result.text
        }))
    }
}