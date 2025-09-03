#!/bin/bash

echo "🚀 Setting up PerfMaster - AI-Powered Performance Analyzer"

# Frontend Setup
echo "📦 Setting up Frontend..."
npm install
npm install framer-motion three @types/three @tensorflow/tfjs
npm install lucide-react recharts socket.io-client
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog
npm install @radix-ui/react-avatar @radix-ui/react-badge
npm install @radix-ui/react-button @radix-ui/react-card
npm install @radix-ui/react-dropdown-menu

# Backend Setup
echo "🐍 Setting up Backend..."
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Database Setup
echo "🗄️ Setting up Database..."
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput --username admin --email admin@perfmaster.com || true

# Create AI models directory
mkdir -p ai_models
mkdir -p logs

echo "✅ Setup complete!"
echo ""
echo "🔧 To start development:"
# echo "Frontend: npm run dev"
# echo "Backend: cd backend && python manage.py runserver"
echo "Celery: cd backend && celery -A perfmaster worker -l info"
# echo ""
# echo "🐳 To start with Docker:"
# echo "docker-compose up --build"
