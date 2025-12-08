# MinihaAI - AI Text Humanization & Detection Platform

<div align="center">

![MinihaAI Logo](public/favicon.svg)

**Transform AI-generated content into natural, authentic human writing with zero detectable AI tone.**

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-purple.svg)](https://vitejs.dev/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 📖 About

MinihaAI is an advanced AI-powered platform that transforms robotic AI-generated text into natural, human-like writing. Our sophisticated humanization engine bypasses AI detection systems (Turnitin, GPTZero, Originality.ai) while maintaining the original meaning and improving readability.

### Key Capabilities

- **Text Humanization**: Convert AI-generated content into natural, undetectable human writing
- **AI Detection**: Analyze text to identify AI-generated content with detailed probability scores
- **Multiple Tones**: 7 different writing tones (Standard, Casual, Professional, Academic, Witty, Empathetic, Persuasive)
- **Advanced Settings**: Customizable vocabulary levels and humanization intensity
- **Real-time Processing**: Fast, secure text processing with no content storage

---

## ✨ Features

### Free Tier
- ✅ 10 humanizations per day
- ✅ 3 AI detections per day
 - ✅ Access to all tones (Academic default)
- ✅ Basic vocabulary levels
- ✅ Intensity up to 70%

### Pro Plan ($5/month)
- 🚀 **Unlimited** humanizations
- 🚀 **Unlimited** AI detections
- 🚀 All 7 writing tones
- 🚀 Advanced vocabulary levels (Simple, Standard, Advanced)
- 🚀 Full intensity control (0-100%)
- 🚀 Priority processing

### Security & Privacy
- 🔒 **Zero Content Storage**: Your text is processed in real-time and immediately discarded
- 🔒 **No Training Data**: We never use your content to train AI models
- 🔒 **Secure Authentication**: Email/password authentication with encrypted storage
- 🔒 **Privacy-First**: Your content remains completely private

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.3.3
- **Build Tool**: Vite 5.4.11
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks + LocalStorage
- **Backend API**: RESTful API (separate repository: [minihaai-backend](https://github.com/sahilhaq2003/minihaai-backend))
- **AI Service**: Google Gemini API (via backend proxy)

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running (see [minihaai-backend](https://github.com/sahilhaq2003/minihaai-backend) repository)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahilhaq2003/MinihaAI.git
   cd MinihaAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_BACKEND_URL=http://localhost:3001/api
   ```
   
   For production, set:
   ```env
   VITE_BACKEND_URL=https://your-backend-url.com/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173`

---

## 📝 Usage

### Getting Started

1. **Sign Up**: Create an account with your email and password
2. **Verify Email**: Check your inbox for verification link (optional)
3. **Start Humanizing**: Paste your AI-generated text and click "Humanize"
4. **Upgrade to Pro**: Unlock unlimited usage and advanced features

### Features Guide

#### Text Humanization
- Paste your AI-generated text in the input area
 - Select your preferred tone (Academic default; all tones available for free users)
- Adjust vocabulary level and intensity (if Pro)
- Click "Humanize" to transform your text
- Copy the humanized output

#### AI Detection
- Navigate to the Detector tab
- Paste or upload text file (.txt)
- Click "Detect Text" to analyze
- View detailed AI probability scores and sentence-by-sentence analysis

#### History
- View your past humanizations in the sidebar
- Click any history item to reload it
- Clear history when needed

---

## 📁 Project Structure

```
MinihaAI/
├── components/          # React components
│   ├── AdminDashboard.tsx
│   ├── Button.tsx
│   ├── Header.tsx
│   ├── History.tsx
│   ├── Pricing.tsx
│   ├── Profile.tsx
│   ├── QRPayment.tsx
│   └── ...
├── services/            # API service functions
│   ├── authService.ts   # Authentication services
│   └── geminiService.ts # AI API services
├── public/              # Static assets
│   ├── favicon.svg
│   └── qr-payment.jpeg
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3001/api` |

---

## 🔗 Related Repositories

- **Backend**: [minihaai-backend](https://github.com/sahilhaq2003/minihaai-backend) - Node.js/Express backend server

---

## 📚 Documentation

- [Gemini API Setup Guide](./GEMINI_API_SETUP.md)
- [Email Setup Guide](./EMAIL_SETUP_GUIDE.md)
- [Payment Setup Guide](./FREE_PAYMENT_SETUP.md)
- [Vercel Deployment Guide](./VERCEL_DEPLOY.md)

---

## 🎯 Features in Detail

### Text Humanization
- **7 Writing Tones**: Standard, Casual, Professional, Academic, Witty, Empathetic, Persuasive
- **3 Vocabulary Levels**: Simple (High School), Standard (College), Advanced (PhD)
- **Intensity Control**: 0-100% humanization intensity
- **Real-time Processing**: Fast, secure processing with immediate results

### AI Detection
- **Advanced Analysis**: Sentence-by-sentence AI probability scoring
- **Multiple Model Detection**: Identifies potential AI models (ChatGPT, GPT-4, Gemini, etc.)
- **Detailed Metrics**: Perplexity, burstiness, vocabulary richness analysis
- **File Upload Support**: Upload .txt files for detection

### User Management
- **Secure Authentication**: Email/password with encrypted storage
- **Email Verification**: Optional email verification system
- **Password Reset**: Forgot password functionality
- **Profile Management**: Update profile, change password, delete account
- **Payment Tracking**: View payment history and subscription status

---

## 🔐 Security

- All API calls go through secure backend proxy
- API keys stored server-side only
- User content never stored or logged
- SSL/TLS encryption for all data transmission
- Secure password hashing (bcrypt)
- Session management via secure tokens

---

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed instructions.

### Other Platforms

The app can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any Node.js hosting service

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👨‍💻 Developer

**Sahil Haq**

- GitHub: [@sahilhaq2003](https://github.com/sahilhaq2003)

---

## 📞 Support

For support, email support@minihaai.com or open an issue in this repository.

---

## 🙏 Acknowledgments

- Google Gemini API for AI processing
- React and Vite teams for amazing tools
- All contributors and users of MinihaAI

---

<div align="center">

**Made with ❤️ by Sahil Haq**

⭐ Star this repo if you find it helpful!

</div>
