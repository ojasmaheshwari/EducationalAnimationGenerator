# Educational Animation Generator Dockerfile
# Combines Python (Manim) + Node.js for full-stack animation generation

FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    NODE_VERSION=20

# Install system dependencies for Manim
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build essentials
    build-essential \
    pkg-config \
    # Manim dependencies
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    libglib2.0-dev \
    # LaTeX (for mathematical text rendering)
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-science \
    dvipng \
    dvisvgm \
    # Additional utilities
    curl \
    git \
    # Clean up apt cache
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN python --version && node --version && npm --version

# Create app directory
WORKDIR /app

# Install Python dependencies (Manim) globally
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir manim

# Create virtual environment that the backend expects
# (backend/src/controllers/render.controller.js uses ./src/venv/bin/activate)
RUN python -m venv /app/backend/src/venv \
    && /app/backend/src/venv/bin/pip install --no-cache-dir manim

# Copy backend package files and install dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy frontend package files and install dependencies
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

# Copy application source code
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Build frontend for production
WORKDIR /app/frontend
RUN npm run build

# Create media directories for Manim output
WORKDIR /app/backend
RUN mkdir -p media/videos media/images media/Tex media/texts src/codes

# Expose ports (backend: 3000, frontend dev: 5173)
EXPOSE 3000 5173

# Default command - run the backend server
CMD ["npm", "run", "dev"]

