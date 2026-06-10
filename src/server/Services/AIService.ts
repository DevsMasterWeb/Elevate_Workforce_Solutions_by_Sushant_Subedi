import { GoogleGenAI, Type } from "@google/genai";
import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export class AIService {
  private static getAI() {
    const apiKey = (process.env.USER_GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.MY_CUSTOM_KEY || "AIzaSyCcQE8rHvLTuTn9udfgArBJ1dbGSm7mrug")?.replace(/['"]+/g, '').trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '' || apiKey === 'AI Studio Free Tier') {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  static async parseResume(filePath: string) {
    const ai = this.getAI();
    if (!ai) return null;

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const textResult = await parser.getText();
      const resumeText = textResult.text;

      const prompt = `
        You are an expert resume parser. Extract the following information from the resume text provided.
        
        Resume Text:
        ${resumeText.substring(0, 10000)}
        
        Extract:
        1. Skills (as a comma-separated string)
        2. Education (highest degree and institution)
        3. A short professional bio (max 3 sentences)
        4. Phone number
        5. Address/Location
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skills: { type: Type.STRING },
              education: { type: Type.STRING },
              bio: { type: Type.STRING },
              phone: { type: Type.STRING },
              address: { type: Type.STRING }
            },
            required: ["skills", "education", "bio", "phone", "address"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        console.error("AI Quota Exceeded. Please try again in a minute.");
      } else {
        console.error("Resume Parsing Error:", error);
      }
      return null;
    }
  }

  static async analyzeApplication(jobDescription: string, jobRequirements: string, profile: any) {
    const ai = this.getAI();
    if (!ai) return { score: null, feedback: "AI Analysis skipped." };

    try {
      const prompt = `
        You are an expert Applicant Tracking System (ATS) analyzer.
        Compare the candidate's profile with the job description and requirements.
        
        Job Description: ${jobDescription}
        Job Requirements: ${jobRequirements}
        
        Candidate Profile:
        Skills: ${profile.skills || 'Not specified'}
        Education: ${profile.education || 'Not specified'}
        Bio: ${profile.bio || 'Not specified'}
        
        Analyze the match and provide:
        1. A match score from 0 to 100.
        2. A concise feedback explaining the score.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ["score", "feedback"]
          }
        }
      });

      const result = JSON.parse(response.text || '{"score": 0, "feedback": "Failed to analyze."}');
      return { score: Math.round(result.score), feedback: result.feedback };
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        return { score: 0, feedback: "AI Analysis paused due to rate limits. Please try again later." };
      }
      console.error("ATS Analysis Error:", error);
      return { score: null, feedback: "Error during AI analysis." };
    }
  }
}
