const Groq = require('groq-sdk');

// Dynamic import for Octokit
let Octokit;

const initializeOctokit = async () => {
  if (!Octokit) {
    const octokitModule = await import('octokit');
    Octokit = octokitModule.Octokit;
  }
  return new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEy // Note: Fix the typo in your .env (GROQ_API_KEy should be GROQ_API_KEY)
});

const analyzeGitHubRepository = async (repoUrl) => {
  try {
    const octokit = await initializeOctokit();
    
    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL format');
    }
    
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    // Get repository information
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo: cleanRepo
    });

    // Get repository contents
    const { data: contents } = await octokit.rest.repos.getContent({
      owner,
      repo: cleanRepo,
      path: ''
    });

    // Get README content if exists
    let readmeContent = '';
    const readmeFile = contents.find(file => 
      file.name.toLowerCase().startsWith('readme')
    );
    
    if (readmeFile) {
      const { data: readmeData } = await octokit.rest.repos.getContent({
        owner,
        repo: cleanRepo,
        path: readmeFile.name
      });
      readmeContent = Buffer.from(readmeData.content, 'base64').toString();
    }

    // Get package.json for technology stack
    let packageJsonContent = '';
    const packageFile = contents.find(file => file.name === 'package.json');
    
    if (packageFile) {
      const { data: packageData } = await octokit.rest.repos.getContent({
        owner,
        repo: cleanRepo,
        path: 'package.json'
      });
      packageJsonContent = Buffer.from(packageData.content, 'base64').toString();
    }

    // Get recent commits for activity analysis
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo: cleanRepo,
      per_page: 10
    });

    // Get languages used
    const { data: languages } = await octokit.rest.repos.listLanguages({
      owner,
      repo: cleanRepo
    });

    return {
      repository: repoData,
      contents,
      readme: readmeContent,
      packageJson: packageJsonContent,
      commits,
      languages
    };

  } catch (error) {
    console.error('GitHub API Error:', error);
    throw new Error(`Failed to analyze repository: ${error.message}`);
  }
};

const generateAIAnalysis = async (repoData, judgingCriteria) => {
  try {
    const prompt = `
You are an expert hackathon judge analyzing a GitHub repository. Based on the following repository data and judging criteria, provide a comprehensive analysis.

REPOSITORY DATA:
- Name: ${repoData.repository.name}
- Description: ${repoData.repository.description || 'No description'}
- Stars: ${repoData.repository.stargazers_count}
- Forks: ${repoData.repository.forks_count}
- Language: ${repoData.repository.language || 'Not specified'}
- Languages Used: ${JSON.stringify(repoData.languages)}
- Created: ${repoData.repository.created_at}
- Last Updated: ${repoData.repository.updated_at}
- Commits (last 10): ${repoData.commits.length} commits
- File Structure: ${repoData.contents.map(file => file.name).join(', ')}

README CONTENT:
${repoData.readme || 'No README available'}

PACKAGE.JSON:
${repoData.packageJson || 'No package.json found'}

JUDGING CRITERIA:
${judgingCriteria.map(criteria => `- ${criteria.title} (Weight: ${criteria.weight || 1}, Max Score: ${criteria.maxScore || 10}): ${criteria.description || ''}`).join('\n')}

Please analyze this repository and provide:

1. **Technical Quality Score** (0-100): Code structure, best practices, technology choices
2. **Innovation Score** (0-100): Uniqueness, creativity, novel approaches
3. **Documentation Score** (0-100): README quality, code comments, setup instructions
4. **Functionality Score** (0-100): Feature completeness, working state, user experience
5. **Overall Recommendation**: Strong recommendation, moderate recommendation, or concerns

For each score, provide:
- The numerical score
- 2-3 key strengths
- 2-3 areas for improvement
- Specific examples from the code/repository

Format your response as a JSON object with this structure:
{
  "technicalQuality": {
    "score": number,
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "examples": ["example1", "example2"]
  },
  "innovation": {
    "score": number,
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "examples": ["example1", "example2"]
  },
  "documentation": {
    "score": number,
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "examples": ["example1", "example2"]
  },
  "functionality": {
    "score": number,
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "examples": ["example1", "example2"]
  },
  "overallScore": number,
  "recommendation": "strong" | "moderate" | "concerns",
  "summary": "Brief overall summary of the project",
  "keyHighlights": ["highlight1", "highlight2", "highlight3"],
  "suggestedImprovements": ["improvement1", "improvement2", "improvement3"]
}
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert hackathon judge with deep technical knowledge. Analyze repositories fairly and provide constructive feedback. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 2000
    });

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse JSON response
    const analysis = JSON.parse(analysisText);
    
    return {
      ...analysis,
      analyzedAt: new Date(),
      repositoryUrl: repoData.repository.html_url,
      repositoryName: repoData.repository.name
    };

  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error(`Failed to generate AI analysis: ${error.message}`);
  }
};

const analyzeProject = async (githubUrl, judgingCriteria) => {
  try {
    // Step 1: Analyze GitHub repository
    const repoData = await analyzeGitHubRepository(githubUrl);
    
    // Step 2: Generate AI analysis
    const aiAnalysis = await generateAIAnalysis(repoData, judgingCriteria);
    
    return {
      success: true,
      analysis: aiAnalysis,
      repositoryData: {
        name: repoData.repository.name,
        description: repoData.repository.description,
        language: repoData.repository.language,
        stars: repoData.repository.stargazers_count,
        forks: repoData.repository.forks_count,
        lastUpdated: repoData.repository.updated_at
      }
    };

  } catch (error) {
    console.error('Project Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  analyzeProject
};