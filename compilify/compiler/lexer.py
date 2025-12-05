"""
Lexical Analyzer for Mathematical Expressions

This module provides lexical analysis functionality for tokenizing
mathematical expressions and basic programming constructs.

Author: Compilify Team
Version: 1.0.0
"""

import re
import html
from typing import List, Dict, Any


class Token:
    """
    Represents a single token in the lexical analysis.
    
    Attributes:
        type (str): The type of the token (e.g., 'NUMBER', 'IDENTIFIER')
        value (str): The actual value of the token
        position (int): The position in the source code where the token was found
    """
    
    def __init__(self, type_: str, value: str, position: int):
        self.type = type_
        self.value = value
        self.position = position
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert token to dictionary representation."""
        return {
            'type': self.type,
            'value': self.value,
            'position': self.position
        }
    
    def __repr__(self) -> str:
        return f"Token({self.type}, '{self.value}', {self.position})"


class Lexer:
    """
    Lexical analyzer for mathematical expressions and basic programming constructs.
    
    Supports tokenization of:
    - Numbers (integers and floats)
    - Keywords (int, float, char, if, else, while, for)
    - Identifiers (variable names)
    - Operators (+, -, *, /, =)
    - Punctuation ((, ), ;)
    """
    
    # Token patterns in order of precedence
    TOKEN_PATTERNS = [
        ('NUMBER', r'\d+(\.\d*)?'),          # Numbers (int/float)
        ('INT', r'\bint\b'),                  # int keyword
        ('FLOAT', r'\bfloat\b'),              # float keyword
        ('CHAR', r'\bchar\b'),                # char keyword
        ('IF', r'\bif\b'),                    # if keyword
        ('ELSE', r'\belse\b'),                # else keyword
        ('WHILE', r'\bwhile\b'),              # while keyword
        ('FOR', r'\bfor\b'),                  # for keyword
        ('IDENTIFIER', r'[a-zA-Z_][a-zA-Z0-9_]*'),  # Variable names
        ('ASSIGN', r'='),                     # Assignment operator
        ('PLUS', r'\+'),                      # Addition operator
        ('MINUS', r'-'),                      # Subtraction operator
        ('MULTIPLY', r'\*'),                  # Multiplication operator
        ('DIVIDE', r'/'),                     # Division operator
        ('LPAREN', r'\('),                    # Left parenthesis
        ('RPAREN', r'\)'),                    # Right parenthesis
        ('SEMICOLON', r';'),                  # Semicolon
        ('WHITESPACE', r'\s+'),               # Whitespace (ignored)
    ]
    
    def __init__(self):
        """Initialize the lexer."""
        self.tokens: List[Token] = []
        self.position: int = 0
    
    def tokenize(self, code: str) -> List[Dict[str, Any]]:
        """
        Tokenize the input code into a list of tokens.
        
        Args:
            code (str): The source code to tokenize
            
        Returns:
            List[Dict[str, Any]]: List of token dictionaries
            
        Raises:
            SyntaxError: If an invalid character is encountered
        """
        self.tokens = []
        self.position = 0
        
        # Unescape HTML entities
        code = html.unescape(code)
        
        while self.position < len(code):
            matched = False
            
            # Try to match each token pattern
            for token_type, pattern in self.TOKEN_PATTERNS:
                regex = re.compile(pattern)
                match = regex.match(code, self.position)
                
                if match:
                    value = match.group(0)
                    
                    # Skip whitespace tokens
                    if token_type != 'WHITESPACE':
                        token = Token(token_type, value, self.position)
                        self.tokens.append(token)
                    
                    self.position = match.end()
                    matched = True
                    break
            
            # Handle unrecognized characters
            if not matched:
                char = code[self.position] if self.position < len(code) else 'EOF'
                raise SyntaxError(f"Invalid character '{char}' at position {self.position}")
        
        return [token.to_dict() for token in self.tokens]
    
    def get_tokens(self) -> List[Token]:
        """Get the list of Token objects."""
        return self.tokens
    
    def reset(self):
        """Reset the lexer state."""
        self.tokens = []
        self.position = 0