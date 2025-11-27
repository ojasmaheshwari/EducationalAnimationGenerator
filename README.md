# FrameForge — Educational Animation Generator

FrameForge transforms plain-language explanations into clear, visual educational animations. Users describe any concept they want to see illustrated — for example, binary addition — and the system automatically converts that description into a complete Manim animation.

# How It Works

Users provide a natural-language description of a concept they want visualized.

The backend performs a series of structured LLM calls:

- Step decomposition: The first model call breaks the user’s description into a coherent sequence of instructional steps.

- Animation generation: The second call converts the step list into executable Manim Python code.

If the generated script fails during compilation, the system captures the error and the original code, then requests a corrected version from the model. This recovery process runs up to two times.

Once a valid script is produced, Manim renders the final animation.

The completed animation is delivered back to the user through the interface.
