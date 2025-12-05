# Compilify - Lexical Analyzer

Educational lexical analysis tool built with pure web technologies.

## Tech Stack

- **HTML5** - Structure and markup
- **Tailwind CSS** - Styling and responsive design
- **Vanilla JavaScript** - Core logic and tokenization
- **Monaco Editor** - Code editor (VS Code engine)
- **GSAP** - Smooth animations

## How It Works

1. **Input**: User types code in Monaco editor
2. **Tokenization**: JavaScript regex patterns match tokens
3. **Classification**: Tokens categorized (keywords, operators, etc.)
4. **Visualization**: Color-coded tokens with animations
5. **Symbol Table**: Identifiers extracted and displayed

## Project Structure

```
Compilify/
├── index.html    # Main HTML with embedded Tailwind
├── js/
│   ├── lexer.js  # Tokenization engine
│   └── app.js    # UI logic and Monaco integration
└── README.md
```

## Supported Tokens

- **Keywords**: `int`, `float`, `char`, `if`, `else`, `while`, `for`
- **Operators**: `+`, `-`, `*`, `/`, `=`
- **Identifiers**: Variable names
- **Numbers**: Integers and floats
- **Punctuation**: `(`, `)`, `;`

## Usage

1. Open `index.html` in browser
2. Type code in editor
3. See real-time token analysis

**Example:**
```c
int x = 5 + (y * 2);
```

## Features

- Real-time tokenization
- Color-coded token visualization
- Symbol table generation
- Responsive design
- No server required