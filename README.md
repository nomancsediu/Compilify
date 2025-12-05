# 🔍 Compilify - Lexical Analyzer & Tokenizer

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.0+-green.svg)](https://djangoproject.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An educational web application that visualizes lexical analysis and tokenization for mathematical expressions and basic programming constructs. Built with Django and modern web technologies for interactive learning.

## ✨ Features

- **🎯 Lexical Analysis**: Interactive tokenization with color-coded visualization
- **🌈 Token Highlighting**: Real-time token identification and classification
- **📊 Symbol Table**: Automatic symbol table generation for variables
- **⚡ Real-time Updates**: Code changes are instantly reflected in visualizations
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Modern UI**: Clean, dark theme with smooth animations

## 🛠️ Technology Stack

- **Backend**: Python 3.8+ with Django 4.0+ and Django REST Framework
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Lexer**: Custom lexical analyzer implementation
- **Animations**: GSAP for smooth transitions
- **Editor**: Monaco Editor for enhanced code input
- **Deployment**: Ready for production with WhiteNoise and Gunicorn

## 🎓 Educational Value

This project is designed for:
- **Computer Science Students**: Understanding lexical analysis fundamentals
- **Programming Language Courses**: Visual learning of tokenization process
- **Self-learners**: Interactive exploration of how compilers read code
- **Educators**: Teaching tool for compiler construction basics

## 🔧 Core Features

### Lexical Analysis (Tokenization)
- Breaks source code into tokens with precise position tracking
- Color-coded token visualization by category:
  - 🟣 **Keywords** (int, float, char, if, else, while, for)
  - 🔵 **Variables** (identifiers)
  - 🟢 **Numbers** (integers and floats)
  - 🟠 **Operators** (+, -, *, /, =)
  - 🟣 **Parentheses** ((, ))
  - ⚪ **Delimiters** (;)
- Interactive token boxes with hover effects
- Comprehensive token and symbol tables
- Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/nomancsediu/Compilify.git
cd Compilify
```

2. **Create virtual environment (recommended):**
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run database migrations:**
```bash
python manage.py migrate
```

5. **Collect static files:**
```bash
python manage.py collectstatic --noinput
```

6. **Start the development server:**
```bash
python manage.py runserver
```

7. **Open your browser and navigate to:**
```
http://localhost:8000
```

### 🎮 Quick Start (Windows)
Double-click `start_server.bat` for automatic setup and launch!

## 📖 Usage Guide

1. **✍️ Write Code**: Enter mathematical expressions or simple C-like code in the Monaco editor
   ```c
   int x = 5;
   result = x + 10 * (y - 2);
   ```

2. **👀 View Tokens**: See real-time tokenization with color-coded visualization
   - Each token appears as a colored box with category and type information
   - Tokens are arranged in a 6-column grid for easy viewing

3. **🎯 Interactive Elements**: 
   - Hover over token boxes for enhanced visual feedback
   - Smooth animations guide your attention to new tokens

4. **📊 Tables**: 
   - **Token Table**: Complete list of all tokens with lexeme, type, and category
   - **Symbol Table**: Unique variables/identifiers found in your code

## 🎯 Supported Language Features

### ✅ Currently Supported
- **Data Types**: `int`, `float`, `char`
- **Arithmetic Operators**: `+`, `-`, `*`, `/`
- **Assignment**: `=`
- **Control Keywords**: `if`, `else`, `while`, `for`
- **Identifiers**: Variable names (a-z, A-Z, _, 0-9)
- **Numbers**: Integers and floating-point numbers
- **Punctuation**: `(`, `)`, `;`

### 📝 Example Expressions
```c
// Simple arithmetic
x + 5 * (y - 2)

// Variable assignment
result = a * b + c

// With keywords
int value = 10;
float pi = 3.14;
```

## 🏗️ Project Structure

```
Compilify/
├── compilify/                 # Django project
│   ├── compiler/             # Main app
│   │   ├── lexer.py         # Lexical analyzer implementation
│   │   ├── views.py         # API endpoints
│   │   └── urls.py          # URL routing
│   ├── settings.py          # Django settings
│   └── urls.py              # Main URL configuration
├── static/                   # Static files
│   └── js/
│       ├── modules/
│       │   ├── editor-manager.js      # Monaco editor management
│       │   ├── ui-manager.js          # UI state management
│       │   └── lexical-analyzer.js    # Frontend lexer interface
│       └── compiler.js               # Main application coordinator
├── templates/
│   └── index.html           # Main HTML template
├── requirements.txt         # Python dependencies
├── start_server.bat        # Windows quick start script
└── README.md               # This file
```

## 🌐 API Documentation

### POST `/api/lexical/`
Perform lexical analysis on source code.

**Request:**
```json
{
    "code": "x + 5 * (y - 2);"
}
```

**Success Response:**
```json
{
    "success": true,
    "tokens": [
        {"type": "IDENTIFIER", "value": "x", "position": 0},
        {"type": "PLUS", "value": "+", "position": 2},
        {"type": "NUMBER", "value": "5", "position": 4},
        {"type": "MULTIPLY", "value": "*", "position": 6},
        {"type": "LPAREN", "value": "(", "position": 8},
        {"type": "IDENTIFIER", "value": "y", "position": 9},
        {"type": "MINUS", "value": "-", "position": 11},
        {"type": "NUMBER", "value": "2", "position": 13},
        {"type": "RPAREN", "value": ")", "position": 14},
        {"type": "SEMICOLON", "value": ";", "position": 15}
    ],
    "token_count": 10
}
```

**Error Response:**
```json
{
    "success": false,
    "error": "Syntax Error: Invalid character '!' at position 5"
}
```

## 🚀 Deployment

### Production Deployment

1. **Set environment variables:**
```bash
export DEBUG=False
export SECRET_KEY="your-secret-key-here"
export ALLOWED_HOSTS="yourdomain.com,www.yourdomain.com"
```

2. **Install production dependencies:**
```bash
pip install gunicorn whitenoise
```

3. **Collect static files:**
```bash
python manage.py collectstatic --noinput
```

4. **Run with Gunicorn:**
```bash
gunicorn compilify.wsgi:application --bind 0.0.0.0:8000
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["gunicorn", "compilify.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Heroku Deployment
1. Create `Procfile`:
```
web: gunicorn compilify.wsgi:application --log-file -
```
2. Push to Heroku:
```bash
git push heroku main
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **✨ Make your changes**
4. **✅ Add tests if applicable**
5. **📝 Commit your changes:**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **🚀 Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **🎯 Submit a pull request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use meaningful commit messages
- Add docstrings to new functions
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Educational Purpose**: Built to make compiler concepts accessible and interactive
- **Inspiration**: Classic compiler design principles and modern web technologies
- **Libraries**: Thanks to Django, Monaco Editor, GSAP, and Tailwind CSS communities
- **Contributors**: All developers who have contributed to making this project better

## 📞 Support

If you encounter any issues or have questions:

1. **📋 Check the Issues**: Look for existing solutions in [GitHub Issues](https://github.com/nomancsediu/Compilify/issues)
2. **🐛 Report Bugs**: Create a new issue with detailed information
3. **💡 Feature Requests**: We'd love to hear your ideas!
4. **📧 Contact**: Reach out to the development team

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[🌟 Star](https://github.com/nomancsediu/Compilify) • [🍴 Fork](https://github.com/nomancsediu/Compilify/fork) • [🐛 Report Bug](https://github.com/nomancsediu/Compilify/issues) • [💡 Request Feature](https://github.com/nomancsediu/Compilify/issues)

</div>