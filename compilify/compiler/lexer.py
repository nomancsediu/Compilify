import re
import html

class Token:
    def __init__(self, type_, value, position):
        self.type = type_
        self.value = value
        self.position = position
    
    def to_dict(self):
        return {
            'type': self.type,
            'value': self.value,
            'position': self.position
        }

class Lexer:
    TOKEN_PATTERNS = [
        ('NUMBER', r'\d+(\.\d*)?'),
        ('INT', r'\bint\b'),
        ('FLOAT', r'\bfloat\b'),
        ('CHAR', r'\bchar\b'),
        ('IF', r'\bif\b'),
        ('ELSE', r'\belse\b'),
        ('WHILE', r'\bwhile\b'),
        ('FOR', r'\bfor\b'),
        ('IDENTIFIER', r'[a-zA-Z_][a-zA-Z0-9_]*'),
        ('ASSIGN', r'='),
        ('PLUS', r'\+'),
        ('MINUS', r'-'),
        ('MULTIPLY', r'\*'),
        ('DIVIDE', r'/'),
        ('LPAREN', r'\('),
        ('RPAREN', r'\)'),
        ('SEMICOLON', r';'),
        ('WHITESPACE', r'\s+'),
    ]
    
    def __init__(self):
        self.tokens = []
        self.position = 0
    
    def tokenize(self, code):
        self.tokens = []
        self.position = 0
        
        code = html.unescape(code)
        
        while self.position < len(code):
            matched = False
            
            for token_type, pattern in self.TOKEN_PATTERNS:
                regex = re.compile(pattern)
                match = regex.match(code, self.position)
                
                if match:
                    value = match.group(0)
                    if token_type != 'WHITESPACE':
                        token = Token(token_type, value, self.position)
                        self.tokens.append(token)
                    
                    self.position = match.end()
                    matched = True
                    break
            
            if not matched:
                char = code[self.position] if self.position < len(code) else 'EOF'
                raise SyntaxError(f"Invalid character '{char}' at position {self.position}")
        
        return [token.to_dict() for token in self.tokens]