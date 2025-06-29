# AI Resume Builder

A modern, AI-powered resume builder that helps you create professional, ATS-optimized resumes with intelligent assistance and real-time feedback.

## 🚀 Live Demo

**[Try it now on Netlify →](https://ai-resume-builder-pro.netlify.app)**

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/ai-resume-builder-pro/deploys)

## ✨ Features

### 🤖 AI-Powered Assistance
- **Smart Resume Optimization**: AI automatically improves your resume for better ATS compatibility
- **Real-time Chat Support**: Get instant advice on resume improvements
- **Intelligent Content Suggestions**: AI helps you write better job descriptions and achievements
- **ATS Score Analysis**: Real-time scoring with specific improvement recommendations

### 📝 Professional Resume Building
- **Multiple Professional Templates**: Choose from expertly designed templates for different industries
- **Complete Resume Sections**: Personal info, work experience, education, skills, and projects
- **PDF Upload & Parsing**: Import existing resumes and let AI extract the information
- **Professional PDF Export**: Download beautifully formatted, ATS-friendly PDFs

### 🎨 Modern User Experience
- **Dark/Light Mode**: Seamless theme switching
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Preview**: See your resume update as you type
- **Intuitive Interface**: Clean, modern design that's easy to use

### 🔐 Secure & Private
- **User Authentication**: Secure sign-up and login with Supabase
- **Data Privacy**: Your resume data is securely stored and private
- **Cloud Sync**: Access your resumes from anywhere

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **PDF Processing**: PDF.js, jsPDF, html2canvas
- **Deployment**: Netlify
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for AI features)
- Supabase account (for data storage and authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-resume-builder.git
   cd ai-resume-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```env
   # OpenAI API Configuration
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   The database schema will be automatically created when you first run the application. The migration files are included in the `supabase/migrations` directory.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application.

## 🔧 Configuration

### OpenAI API Setup

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `VITE_OPENAI_API_KEY`

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings > API
3. Copy your Project URL and anon/public key
4. Add them to your `.env` file

The database schema includes:
- User authentication and profiles
- Resume storage with versioning
- AI chat history
- Analytics tracking
- Professional templates

## 📱 Features Overview

### Resume Builder
- **Personal Information**: Contact details and professional summary
- **Work Experience**: Detailed job history with achievements
- **Education**: Academic background and honors
- **Skills**: Technical and soft skills with proficiency levels
- **Projects**: Portfolio projects with technologies and links

### AI Assistant
- **Resume Analysis**: Get detailed feedback on your resume
- **Content Improvement**: AI suggests better wording and structure
- **ATS Optimization**: Improve compatibility with applicant tracking systems
- **Keyword Suggestions**: Get relevant keywords for your industry

### Templates
- **Professional Designs**: Multiple templates for different career levels
- **Industry-Specific**: Templates tailored for tech, business, creative fields
- **Fully Customizable**: Edit all content while maintaining professional formatting

## 🚀 Deployment

### Netlify Deployment

This project is configured for easy deployment on Netlify:

1. **Connect your GitHub repository** to Netlify
2. **Set build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Add environment variables** in Netlify dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```
4. **Deploy**: Netlify will automatically build and deploy your site

### Environment Variables for Netlify

In your Netlify dashboard, go to Site settings > Environment variables and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Required for database functionality |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Required for authentication |
| `VITE_OPENAI_API_KEY` | Your OpenAI API key | Required for AI features |

### Manual Deployment

```bash
# Build the project
npm run build

# The dist/ folder contains the built application
# Upload the contents to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure responsive design
- Add proper error handling
- Write clear commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT API that powers our AI features
- **Supabase** for the excellent backend-as-a-service platform
- **Tailwind CSS** for the utility-first CSS framework
- **React** and the amazing React ecosystem
- **Netlify** for seamless deployment and hosting

## 📞 Support

If you have any questions or need help:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/ai-resume-builder/issues)
- **Documentation**: Check this README and code comments
- **Community**: Join discussions in the Issues section

## 🔮 Roadmap

- [ ] **Multiple Resume Versions**: Save and manage different versions
- [ ] **Team Collaboration**: Share resumes with mentors or career counselors
- [ ] **Advanced Analytics**: Detailed insights on resume performance
- [ ] **More AI Features**: Cover letter generation, interview preparation
- [ ] **Integration**: Connect with job boards and LinkedIn
- [ ] **Mobile App**: Native mobile applications

---

**Built with ❤️ using [Bolt](https://bolt.new) - The AI-powered full-stack development platform**

⭐ **Star this repository if you found it helpful!**

## 🔧 Troubleshooting

### Common Issues

1. **"Supabase not configured" error**
   - Ensure you've added the environment variables in Netlify
   - Check that your Supabase project is active
   - Verify the URL and key are correct

2. **AI features not working**
   - Add your OpenAI API key to environment variables
   - Ensure you have credits in your OpenAI account

3. **Build failures**
   - Check that all environment variables are set
   - Ensure Node.js version is 18 or higher

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Create an issue on GitHub with detailed error information