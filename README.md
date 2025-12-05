# Compilify - Interactive Compiler Visualizer

An educational web application that visualizes the core phases of compiler design, built with Django and modern web technologies.

## Features

- **Lexical Analysis**: Interactive tokenization with color-coded visualization
- **Syntax Analysis**: Real-time Abstract Syntax Tree (AST) generation and display
- **Semantic Analysis**: Symbol table management and error detection
- **Real-time Updates**: Code changes are instantly reflected in visualizations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Backend**: Python Django with Django REST Framework
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Parsing**: Custom lexer and parser implementation
- **Visualization**: D3.js for AST rendering, GSAP for animations
- **Editor**: Monaco Editor for code input

## Core Compiler Phases

### 1. Lexical Analysis (Tokenization)
- Breaks source code into tokens
- Color-coded token visualization
- Symbol table generation
- Real-time token highlighting

### 2. Syntax Analysis (Parsing)
- Generates Abstract Syntax Tree (AST)
- Interactive tree visualization with D3.js
- Grammar rule validation
- Parse error detection

### 3. Semantic Analysis
- Type checking and validation
- Symbol table management
- Variable usage tracking
- Semantic error reporting

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
2. **Select Phase**: Click on any of the three compiler phases
3. **View Visualization**: See real-time visualization of the selected phase
4. **Interactive Elements**: Hover over tokens, AST nodes for additional information

## Supported Language Features

- Variable declarations (`int`, `float`, `char`)
- Arithmetic expressions (`+`, `-`, `*`, `/`)
- Assignment statements
- Comparison operations (`==`, `!=`, `<`, `>`, `<=`, `>=`)
- Control structures (`if`, `while`)
- Function calls (`printf`)

## Educational Value

This project is designed for:
- **Computer Science Students**: Understanding compiler fundamentals
- **Programming Language Courses**: Visual learning of compilation process
- **Self-learners**: Interactive exploration of compiler design
- **Educators**: Teaching tool for compiler construction courses

## Project Structure

```
Compilify/
├── compilify/
│   ├── compiler/
│   │   ├── lexer.py          # Tokenization logic
│   │   ├── parser.py         # AST generation
│   │   ├── semantic_analyzer.py  # Semantic analysis
│   │   ├── views.py          # API endpoints
│   │   └── urls.py           # URL routing
│   └── settings.py
├── static/
│   └── js/
│       └── compiler.js       # Frontend visualization
├── templates/
│   └── index.html           # Main interface
└── requirements.txt
```

## API Endpoints

- `POST /api/lexical/` - Lexical analysis
- `POST /api/syntax/` - Syntax analysis  
- `POST /api/semantic/` - Semantic analysis

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