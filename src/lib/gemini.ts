const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface ParsedResume {
  skills: string[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  experience: {
    company: string;
    title: string;
    duration: string;
    description: string;
  }[];
  summary: string;
}

export async function parseResumeWithGemini(resumeText: string): Promise<ParsedResume> {
  const prompt = `You are an expert resume parser. Analyze the following resume text and extract structured information. 
Return a JSON object with exactly this structure:
{
  "skills": ["skill1", "skill2", ...],
  "education": [{"institution": "name", "degree": "degree name", "field": "field of study", "year": "year"}],
  "experience": [{"company": "company name", "title": "job title", "duration": "duration", "description": "description"}],
  "summary": "2-3 sentence professional summary"
}

Resume text:
${resumeText}

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini');
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error parsing resume with Gemini:', error);
    throw error;
  }
}

export async function getJobMatchExplanation(
  candidateSkills: string[],
  jobRequirements: string[]
): Promise<string> {
  const prompt = `You are a career advisor. A candidate has these skills: ${candidateSkills.join(', ')}.
A job requires these skills: ${jobRequirements.join(', ')}.
Provide a brief, encouraging explanation (2-3 sentences) about how well they match and what they could improve.
Focus on the positive matches first, then suggest one area for growth.`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Error getting job match explanation:', error);
    return 'Good match!';
  }
}

export async function getCourseRecommendations(
  skillGaps: string[],
  currentSkills: string[]
): Promise<string[]> {
  const prompt = `Based on these current skills: ${currentSkills.join(', ')}.
And these skill gaps: ${skillGaps.join(', ')}.
Suggest 3 specific course titles that would help bridge the gaps. Return ONLY a JSON array of course titles like ["Course 1", "Course 2", "Course 3"].`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    const jsonMatch = generatedText?.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting course recommendations:', error);
    return [];
  }
}
