const { v4: uuidv4 } = require('uuid');
const { writeFile } = require('fs/promises');
const { exec } = require('child_process');


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

function generateUniqueSceneName() {
  return `MyBeautifulScene_${uuidv4()}`;
}

async function render(description) {
  const prompt = `
You are tasked with creating an educational manim python script for the given user prompt.
Only respond with the python code.

User Prompt: ${description}
    `;

  const output = await generateWithGemini(prompt);

  // Remove the python code string
  const code = output.split('\n').slice(1, -1).join('\n');

  const sceneName = generateUniqueSceneName();
  const filename = `code_${sceneName}.py`;
  const filepath = `src/codes/${filename}`;

  await writeFile(filepath, code, 'utf8');

  console.log(`
    sceneName: ${sceneName},
    filename: ${filename}
    `)

  exec(`. ./src/venv/bin/activate && manim -qm ${filepath} ${sceneName} -o ${sceneName}`,
    (err, stdout, stderr) => {
      if (err) console.error(err);
      else console.log(stdout);
    });

    const videoLink = `${process.env.SERVER_URL}/media/videos/code_${sceneName}/720p30/${sceneName}.mp4`;

    return {
      status: "success",
      videoLink
    }
}

module.exports = render;
