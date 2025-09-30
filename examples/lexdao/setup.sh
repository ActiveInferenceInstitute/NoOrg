#!/bin/bash

# LexDAO Governance Workflow - Setup Script
# This script helps set up the development environment for the LexDAO example

set -e  # Exit on any error

echo "🚀 LexDAO Governance Workflow Setup"
echo "=================================="

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -f "lexdao_workflow.ts" ]]; then
    echo "❌ Error: Please run this script from the examples/lexdao directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 16 ]]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16+"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check Python
if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    echo "   Visit: https://python.org/downloads/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [[ $PYTHON_MAJOR -lt 3 ]] || [[ $PYTHON_MAJOR -eq 3 && $PYTHON_MINOR -lt 8 ]]; then
    echo "❌ Python version $PYTHON_VERSION is too old. Please upgrade to Python 3.8+"
    exit 1
fi

echo "✅ Python $PYTHON_VERSION found"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [[ -d "node_modules" ]]; then
    echo "   Removing existing node_modules..."
    rm -rf node_modules
fi

npm install

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
PYTHON_DEPS=(
    "matplotlib>=3.5.0"
    "pandas>=1.3.0"
    "numpy>=1.21.0"
    "networkx>=2.6"
    "seaborn>=0.11.0"
    "Pillow>=8.0.0"
)

# Check if pip is available
if command_exists pip3; then
    PIP_CMD="pip3"
elif command_exists pip; then
    PIP_CMD="pip"
else
    echo "❌ pip is not installed. Please install pip for Python package management"
    exit 1
fi

echo "   Installing Python packages: ${PYTHON_DEPS[*]}"
$PIP_CMD install --user "${PYTHON_DEPS[@]}" || {
    echo "   Note: If the above failed, you may need to use sudo:"
    echo "   sudo $PIP_CMD install ${PYTHON_DEPS[*]}"
    exit 1
}

# Set up environment file
echo "⚙️  Setting up environment configuration..."
if [[ ! -f ".env" ]]; then
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "   Please edit .env and add your OpenAI API key"
    else
        echo "❌ .env.example not found"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Check for OpenAI API key
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo ""
    echo "⚠️  WARNING: OpenAI API key not configured in .env file"
    echo "   To use LLM agents, you need to:"
    echo "   1. Get an API key from https://platform.openai.com/api-keys"
    echo "   2. Edit .env and replace 'your_openai_api_key_here' with your key"
    echo ""
fi

# Create necessary directories
echo "📁 Creating output directories..."
mkdir -p ../../output
mkdir -p ../../logs

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Run basic tests to verify setup
echo "🧪 Running basic tests..."
if npm test -- --testNamePattern="setup" --passWithNoTests; then
    echo "✅ Basic tests passed"
else
    echo "⚠️  Some tests failed - this might be expected without proper configuration"
fi

# Display setup summary
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📖 Next steps:"
echo "   1. Edit .env file and add your OpenAI API key"
echo "   2. Run 'npm run demo' to execute the workflow"
echo "   3. Run 'npm run visualize' to generate visualizations"
echo "   4. Check the output in ../../output/ directory"
echo ""
echo "🔗 Useful commands:"
echo "   npm run dev      - Development mode with auto-reload"
echo "   npm run demo     - Run the complete workflow"
echo "   npm run test     - Run all tests"
echo "   npm run full-demo - Run workflow + generate visualizations"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "💡 Tip: If you encounter any issues, check the troubleshooting section in README.md"
