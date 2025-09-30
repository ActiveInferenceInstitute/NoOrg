#!/bin/bash

# Cognicism Framework Setup Script
# This script sets up the Cognicism framework environment

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              Cognicism Framework Setup                         ║"
echo "║              Automated Installation Script                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16+."
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) found"

# Check Python (for visualizations)
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python 3 not found. Visualizations will be limited."
    echo "   Install Python 3.8+ for full visualization support."
    PYTHON_AVAILABLE=false
else
    PYTHON_VERSION=$(python3 -c "import sys; print(sys.version_info[0])")
    if [ "$PYTHON_VERSION" -lt 3 ]; then
        echo "⚠️  Python 2 found, but Python 3.8+ recommended for visualizations."
        PYTHON_AVAILABLE=false
    else
        echo "✅ Python $(python3 --version) found"
        PYTHON_AVAILABLE=true
    fi
fi

echo ""

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Cognicism Framework Environment Configuration
OPENAI_API_KEY=your_openai_api_key_here
DEFAULT_MODEL=gpt-4o
MAX_TOKENS=2000

# Optional: Custom configuration
# LOG_LEVEL=debug
# OUTPUT_DIR=./custom_output
EOF
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your OpenAI API key before running the framework!"
else
    echo "✅ .env file already exists"
fi

echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo ""

# Set up Python environment if Python is available
if [ "$PYTHON_AVAILABLE" = true ]; then
    echo "🐍 Setting up Python environment for visualizations..."

    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        echo "✅ Created Python virtual environment"
    else
        echo "✅ Python virtual environment already exists"
    fi

    # Activate virtual environment and install dependencies
    source venv/bin/activate
    pip install --upgrade pip

    # Install required packages for visualizations
    pip install matplotlib numpy pandas plotly networkx seaborn

    echo "✅ Installed Python visualization dependencies"
    deactivate
else
    echo "⚠️  Skipping Python setup - visualizations will use basic HTML output"
fi

echo ""

# Create necessary directories
echo "📁 Creating output directories..."
mkdir -p output
mkdir -p test-output
mkdir -p logs

echo "✅ Created output directories"

echo ""

# Run tests to verify installation
echo "🧪 Running installation verification tests..."
echo "   This may take a few moments..."

if node test-cognicism.js > test-output/installation-test.log 2>&1; then
    echo "✅ Installation tests passed!"
    echo "   See test-output/installation-test.log for details"
else
    echo "⚠️  Some tests failed, but installation completed."
    echo "   Check test-output/installation-test.log for details"
    echo "   You may need to configure your OpenAI API key in .env"
fi

echo ""

# Create quick start script
cat > quick-start.sh << 'EOF'
#!/bin/bash

echo "🚀 Cognicism Framework Quick Start"
echo ""

# Check if API key is configured
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "⚠️  Please configure your OpenAI API key in .env first!"
    echo "   Edit .env and replace 'your_openai_api_key_here' with your actual API key"
    exit 1
fi

echo "✅ API key configured"

echo ""
echo "Choose an option:"
echo "1) Run quick demo"
echo "2) Run interactive demo"
echo "3) Run full workflow"
echo "4) Run tests"
echo "5) Show help"

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "🎯 Running quick demo..."
        node run-demo.js
        ;;
    2)
        echo "🎮 Starting interactive demo..."
        node demo-interactive.js
        ;;
    3)
        echo "🔄 Running full workflow..."
        node cognicism-workflow.js
        ;;
    4)
        echo "🧪 Running test suite..."
        node test-cognicism.js
        ;;
    5)
        echo "📖 Help:"
        echo "   • Quick demo: Fast overview of framework capabilities"
        echo "   • Interactive demo: Explore each component interactively"
        echo "   • Full workflow: Complete end-to-end demonstration"
        echo "   • Tests: Verify all components are working correctly"
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
EOF

chmod +x quick-start.sh

echo "✅ Created quick-start.sh script"

echo ""

# Final setup summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Cognicism Framework is now installed and ready to use!"
echo ""
echo "📋 What was installed:"
echo "   ✅ Node.js dependencies"
if [ "$PYTHON_AVAILABLE" = true ]; then
    echo "   ✅ Python visualization environment"
fi
echo "   ✅ Configuration files (.env)"
echo "   ✅ Output directories"
echo "   ✅ Quick start script"
echo ""
echo "🚀 Getting Started:"
echo "   1. Edit .env and add your OpenAI API key"
echo "   2. Run: ./quick-start.sh"
echo "   3. Choose your preferred demo option"
echo ""
echo "📚 Available Commands:"
echo "   • ./quick-start.sh              - Interactive setup and demos"
echo "   • node run-demo.js              - Quick demonstration"
echo "   • node demo-interactive.js      - Interactive exploration"
echo "   • node test-cognicism.js        - Run comprehensive tests"
echo "   • python3 cognicism_visualizations.py --help  - Visualization options"
echo ""
echo "📖 Documentation:"
echo "   • README.md                     - Comprehensive documentation"
echo "   • cognicism-config.json         - Configuration reference"
echo "   • docs/                         - Additional documentation"
echo ""
echo "🔧 Troubleshooting:"
echo "   • Check logs in output/ and test-output/ directories"
echo "   • Ensure OPENAI_API_KEY is set in .env"
echo "   • Run tests to verify everything is working"
echo ""
echo "Happy exploring with the Cognicism Framework! 🤖✨"
