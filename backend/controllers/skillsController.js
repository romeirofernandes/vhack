const skillsController = {
  // Get available skills
  async getSkills(req, res) {
    try {
      // You can later store these in a database
      const skills = [
        "JavaScript",
        "TypeScript",
        "Python",
        "Java",
        "C",
        "C++",
        "C#",
        "Go",
        "Rust",
        "Ruby",
        "Swift",
        "Kotlin",
        "PHP",
        "R",
        "Scala",
        "React",
        "Next.js",
        "Vue.js",
        "Angular",
        "Svelte",
        "Node.js",
        "Express.js",
        "FastAPI",
        "Django",
        "Flask",
        "Spring Boot",
        "MongoDB",
        "PostgreSQL",
        "MySQL",
        "Redis",
        "Firebase",
        "Supabase",
        "Docker",
        "Kubernetes",
        "AWS",
        "Google Cloud",
        "Azure",
        "GraphQL",
        "REST API",
        "HTML",
        "CSS",
        "Tailwind",
        "Bootstrap",
        "Git",
        "GitHub",
        "Jest",
        "Cypress",
        "Figma",
        "TensorFlow",
        "PyTorch",
        "Blockchain",
        "Solidity",
        "Redux",
        "CI/CD",
      ];

      res.status(200).json({
        success: true,
        skills: skills,
      });
    } catch (error) {
      console.error("Get skills error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch skills",
      });
    }
  },
};

module.exports = skillsController;
