const { v4: uuidv4 } = require('uuid');
const { writeFile } = require('fs/promises');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const MAX_RETRY_ATTEMPTS = 2;

async function generateWithGemini(prompt) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": process.env.LLM_API_KEY
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    })
  });

  const data = await res.json();

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function extractCode(output) {
  let code = output;
  
  // Try to extract code from markdown code block if present
  const codeBlockMatch = code.match(/```(?:python)?\s*\n([\s\S]*?)\n```/i);
  if (codeBlockMatch) {
    code = codeBlockMatch[1];
  } else {
    // Fallback: remove leading/trailing ``` if present
    code = code.replace(/^```(?:python)?\s*\n?/i, '');
    code = code.replace(/\n?```\s*$/i, '');
  }
  
  return code.trim();
}

async function runManim(filepath, sceneName) {
  const { stdout, stderr } = await execAsync(
    `. ./src/venv/bin/activate && manim -ql ${filepath} ${sceneName} -o ${sceneName}`
  );
  console.log(stdout);
  return { stdout, stderr };
}

async function render(description) {
  // Generate sceneId first so we can tell the LLM the exact class name
  const sceneId = uuidv4();
  const sceneName = `MyBeautifulScene_${sceneId.replace(/-/g, '_')}`;

  const prompt1 = `
Break down this animation request into clear sequential steps for a Manim animation.
Output ONLY a numbered list of animation steps, nothing else.
Each step should describe one visual action or transformation.
Keep it concise and specific.

IMPORTANT: When planning steps, ensure text elements are properly spaced and don't overlap.
- Clear/fade out old text before showing new text in the same area
- Position labels away from each other and from main content
- Keep it under 20 steps

User Request: ${description}
`;

  const output1 = await generateWithGemini(prompt1);
  console.log("Animation Steps:\n", output1);

  const prompt = `
You are an expert Manim (Community Edition) programmer. Generate a complete, working Manim script.

CRITICAL REQUIREMENTS:
1. The scene class MUST be named exactly: ${sceneName}
2. Output ONLY valid Python code - no markdown, no explanations, no \`\`\` code fences
3. Start with: from manim import *
4. The class must inherit from Scene and implement construct(self)

MANIM BEST PRACTICES:
- Use self.play() for animations (Create, Write, FadeIn, FadeOut, Transform, etc.)
- Use self.wait() to pause between animations
- Clear or fade out old content before adding new content in the same area
- Position elements carefully to avoid overlap (use .to_edge(), .next_to(), .shift(), .move_to())
- For math equations, use MathTex(r"...") with raw strings
- For regular text, use Text("...")
- Common animations: Create(), Write(), FadeIn(), FadeOut(), Transform(), ReplacementTransform()
- Use VGroup() to group related objects
- Colors: BLUE, RED, GREEN, YELLOW, WHITE, ORANGE, PURPLE, PINK, TEAL, GOLD
- Positions: UP, DOWN, LEFT, RIGHT, ORIGIN, UL, UR, DL, DR

TEXT OVERLAP PREVENTION (CRITICAL):
- NEVER place text on top of other text - always ensure adequate spacing
- Use .scale() to reduce text size if needed to fit without overlapping (e.g., Text("...").scale(0.6))
- Always use buff parameter in .next_to() to add spacing: label.next_to(obj, DOWN, buff=0.3)
- For labels near objects, use small font sizes: Text("label", font_size=24)
- Before adding new text in an area, FadeOut or remove existing text first
- Use .arrange() with buff parameter when stacking multiple text elements: VGroup(text1, text2).arrange(DOWN, buff=0.5)
- Keep titles at the top (.to_edge(UP)) and main content centered or below
- For multiple labels, position them on different sides (UP, DOWN, LEFT, RIGHT) of their target objects
- Test positioning: if text might overlap, shift one element away using .shift(direction * amount)
- Use smaller font_size for secondary text: Text("subtitle", font_size=28) vs Text("title", font_size=48)

LATEX RULES:
- Always use raw strings: MathTex(r"\\frac{a}{b}")
- Escape backslashes properly in LaTeX
- Use \\text{} for regular text within MathTex
- Avoid complex LaTeX - keep it simple

COMMON PATTERNS:
- Arrows: Arrow(start, end, buff=0)
- Axes: Axes(x_range=[...], y_range=[...])
- Graphs: axes.plot(lambda x: ..., color=...)
- Dots: Dot(point, color=...)
- Labels: label.next_to(obj, direction)

Animation Steps to implement:
${output1}

Generate the complete Python code now:
`;

  let output = await generateWithGemini(prompt);
  let code = extractCode(output);
  
  console.log("Generated Manim Code:\n", code);

  const filename = `code_${sceneName}.py`;
  const filepath = `src/codes/${filename}`;

  // Retry loop for error correction
  let lastError = null;
  
  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    await writeFile(filepath, code, 'utf8');

    console.log(`
    Attempt: ${attempt + 1}/${MAX_RETRY_ATTEMPTS + 1}
    sceneName: ${sceneName},
    filename: ${filename}
    `);

    try {
      await runManim(filepath, sceneName);

      return {
        status: "success",
        videoLink: sceneId
      };
    } catch (err) {
      lastError = err;
      const errorMessage = err.stderr || err.message || String(err);
      console.error(`Attempt ${attempt + 1} failed:`, errorMessage);

      // If we have retries left, ask LLM to fix the code
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log("Requesting LLM to fix the code...");
        
        const fixPrompt = `
The following Manim Python code has an error. Fix it and return ONLY the corrected Python code.

CRITICAL REQUIREMENTS:
1. The scene class MUST be named exactly: ${sceneName}
2. Output ONLY valid Python code - no markdown, no explanations, no \`\`\` code fences
3. Start with: from manim import *
4. Fix the error while keeping the same animation intent
5. Ensure text elements do NOT overlap - use proper positioning, scaling, and buff spacing

TEXT OVERLAP PREVENTION:
- Use .scale() to reduce text size if needed
- Use buff parameter in .next_to(): label.next_to(obj, DOWN, buff=0.3)
- FadeOut old text before adding new text in the same area
- Position labels on different sides of objects to avoid collision

ORIGINAL CODE:
${code}

ERROR MESSAGE:
${errorMessage}

Return the complete fixed Python code:
`;

        output = await generateWithGemini(fixPrompt);
        code = extractCode(output);
        console.log("Fixed Manim Code:\n", code);
      }
    }
  }

  // All attempts failed
  console.error("All attempts failed. Last error:", lastError);
  
  return {
    status: "error",
    videoLink: "https://www.shutterstock.com/shutterstock/videos/3944193939/preview/stock-footage-digital-glitch-effect-displaying-oops-something-went-wrong-error-message-on-black-background.webm"
  }
}

module.exports = render;
