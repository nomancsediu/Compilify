# Compilify - Lexical Analyzer & Tokenizer

An educational web application that visualizes lexical analysis and tokenization, built with Django and modern web technologies.

## Features

- **Lexical Analysis**: Interactive tokenization with color-coded visualization
- **Token Highlighting**: Real-time token identification and classification
- **Symbol Table**: Automatic symbol table generation
- **Real-time Updates**: Code changes are instantly reflected in visualizations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Backend**: Python Django with Django REST Framework
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Parsing**: Custom lexer implementation
- **Visualization**: GSAP for animations
- **Editor**: Monaco Editor for code input

## Core Features

### Lexical Analysis (Tokenization)
- Breaks source code into tokens
- Color-coded token visualization by type:
  - **Keywords** (int, float, if, while, etc.)
  - **Identifiers** (variable names)
  - **Literals** (numbers, strings)
  - **Operators** (+, -, *, /, =, etc.)
  - **Punctuation** (parentheses, semicolons, etc.)
- Symbol table generation
- Real-time token highlighting with animations

## Getting Started

### Prerequisites
- Python 3.8+
- Django 4.0+
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nomancsediu/Compilify.git
cd Compilify
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

5. Open your browser and navigate to `http://localhost:8000`

## Usage

1. **Write Code**: Enter C-like code in the Monaco editor
2. **View Tokens**: See real-time tokenization and color-coded visualization
3. **Interactive Elements**: Hover over tokens for enhanced visual feedback
4. **Symbol Table**: View automatically generated symbol table

## Supported Language Features

- Variable declarations (`int`, `float`, `char`)
- Arithmetic expressions (`+`, `-`, `*`, `/`)
- Assignment statements (`=`)
- Comparison operations (`==`, `!=`, `<`, `>`, `<=`, `>=`)
- Control structure keywords (`if`, `else`, `while`, `for`)
- Function calls (`printf`, `scanf`)
- Literals (numbers, strings)
- Punctuation and delimiters

## Educational Value

This project is designed for:
- **Computer Science Students**: Understanding lexical analysis fundamentals
- **Programming Language Courses**: Visual learning of tokenization process
- **Self-learners**: Interactive exploration of how compilers read code
- **Educators**: Teaching tool for compiler construction basics

## Project Structure

```
Compilify/
├── compilify/
│   ├── compiler/
│   │   ├── lexer.py          # Tokenization logic
│   │   ├── views.py          # API endpoints
│   │   └── urls.py           # URL routing
│   └── settings.py
├── static/
│   └── js/
│       ├── modules/
│       │   ├── editor-manager.js
│       │   ├── ui-manager.js
│       │   └── lexical-analyzer.js
│       └── compiler.js       # Main coordinator
├── templates/
│   └── index.html           # Main interface
└── requirements.txt
```

## API Endpoints

- `POST /api/lexical/` - Lexical analysis and tokenization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built for educational purposes
- Inspired by compiler design principles
- Uses modern web technologies for interactive learning