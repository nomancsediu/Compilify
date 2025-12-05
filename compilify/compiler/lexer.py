import re
import html

class Token:
    def __init__(self, type_, value, position, line=1, column=1):
        self.type = type_
        self.value = value
        self.position = position
        self.line = line
        self.column = column
    
    def to_dict(self):
        return {
            'type': self.type,
            'value': self.value,
            'position': self.position,
            'line': self.line,
            'column': self.column
        }

class SymbolTable:
    def __init__(self):
        self.symbols = {}
        self.next_id = 1
    
    def add_symbol(self, name, token_type='IDENTIFIER'):
        if name not in self.symbols:
            self.symbols[name] = {
                'id': self.next_id,
                'name': name,
                'type': token_type,
                'first_occurrence': None
            }
            self.next_id += 1
        return self.symbols[name]
    
    def to_dict(self):
        return {
            'symbols': self.symbols,
            'count': len(self.symbols)
        }

class LexicalError:
    def __init__(self, message, position, line, column, char):
        self.message = message
        self.position = position
        self.line = line
        self.column = column
        self.char = char
    
    def to_dict(self):
        return {
            'message': self.message,
            'position': self.position,
            'line': self.line,
            'column': self.column,
            'char': self.char
        }

class Lexer:
    TOKEN_PATTERNS = [
        # Comments (skip these)
        ('SINGLE_LINE_COMMENT', r'//.*'),
        ('MULTI_LINE_COMMENT', r'/\*[\s\S]*?\*/'),
        
        # Numbers
        ('NUMBER', r'\d+(\.\d*)?'),
        
        # Keywords
        ('INT', r'\bint\b'),
        ('FLOAT', r'\bfloat\b'),
        ('CHAR', r'\bchar\b'),
        ('IF', r'\bif\b'),
        ('ELSE', r'\belse\b'),
        ('WHILE', r'\bwhile\b'),
        ('FOR', r'\bfor\b'),
        ('RETURN', r'\breturn\b'),
        ('PRINTF', r'\bprintf\b'),
        ('SCANF', r'\bscanf\b'),
        
        # Identifiers
        ('IDENTIFIER', r'[a-zA-Z_][a-zA-Z0-9_]*'),
        
        # Operators (order matters for multi-char operators)
        ('EQ', r'=='),
        ('NE', r'!='),
        ('LE', r'<='),
        ('GE', r'>='),
        ('ASSIGN', r'='),
        ('LT', r'<'),
        ('GT', r'>'),
        ('PLUS', r'\+'),
        ('MINUS', r'-'),
        ('MULTIPLY', r'\*'),
        ('DIVIDE', r'/'),
        
        # Punctuation
        ('LPAREN', r'\('),
        ('RPAREN', r'\)'),
        ('LBRACE', r'\{'),
        ('RBRACE', r'\}'),
        ('SEMICOLON', r';'),
        ('COMMA', r','),
        
        # Strings
        ('STRING', r'"([^\\"]|\\.)*"'),
        
        # Whitespace (skip these)
        ('WHITESPACE', r'\s+'),
        ('NEWLINE', r'\n'),
    ]
    
    def __init__(self):
        self.tokens = []
        self.symbol_table = SymbolTable()
        self.errors = []
        self.warnings = []
        self.position = 0
        self.line = 1
        self.column = 1
        self.skipped_items = {
            'whitespace_count': 0,
            'comment_count': 0,
            'newline_count': 0
        }
    
    def tokenize(self, code):
        self.tokens = []
        self.symbol_table = SymbolTable()
        self.errors = []
        self.warnings = []
        self.position = 0
        self.line = 1
        self.column = 1
        self.skipped_items = {
            'whitespace_count': 0,
            'comment_count': 0,
            'newline_count': 0
        }
        
        # Decode HTML entities
        code = html.unescape(code)
        
        while self.position < len(code):
            matched = False
            
            for token_type, pattern in self.TOKEN_PATTERNS:
                regex = re.compile(pattern)
                match = regex.match(code, self.position)
                
                if match:
                    value = match.group(0)
                    start_pos = self.position
                    start_line = self.line
                    start_column = self.column
                    
                    # Update position tracking
                    self.position = match.end()
                    
                    # Update line and column tracking
                    for char in value:
                        if char == '\n':
                            self.line += 1
                            self.column = 1
                        else:
                            self.column += 1
                    
                    # Handle different token types
                    if token_type == 'WHITESPACE':
                        self.skipped_items['whitespace_count'] += 1
                    elif token_type == 'NEWLINE':
                        self.skipped_items['newline_count'] += 1
                    elif token_type in ['SINGLE_LINE_COMMENT', 'MULTI_LINE_COMMENT']:
                        self.skipped_items['comment_count'] += 1
                    else:
                        # Create token
                        token = Token(token_type, value, start_pos, start_line, start_column)
                        self.tokens.append(token)
                        
                        # Update symbol table for identifiers
                        if token_type == 'IDENTIFIER':
                            symbol = self.symbol_table.add_symbol(value)
                            if symbol['first_occurrence'] is None:
                                symbol['first_occurrence'] = {
                                    'line': start_line,
                                    'column': start_column
                                }
                    
                    matched = True
                    break
            
            if not matched:
                # Handle lexical errors
                char = code[self.position] if self.position < len(code) else 'EOF'
                error = LexicalError(
                    f"Invalid character '{char}'",
                    self.position,
                    self.line,
                    self.column,
                    char
                )
                self.errors.append(error)
                
                # Skip the invalid character and continue
                self.position += 1
                self.column += 1
        
        # Generate warnings
        self._generate_warnings()
        
        return {
            'tokens': [token.to_dict() for token in self.tokens],
            'symbol_table': self.symbol_table.to_dict(),
            'errors': [error.to_dict() for error in self.errors],
            'warnings': self.warnings,
            'statistics': {
                'total_tokens': len(self.tokens),
                'unique_identifiers': len(self.symbol_table.symbols),
                'skipped_whitespace': self.skipped_items['whitespace_count'],
                'skipped_comments': self.skipped_items['comment_count'],
                'skipped_newlines': self.skipped_items['newline_count'],
                'lexical_errors': len(self.errors)
            }
        }
    
    def _generate_warnings(self):
        # Check for potential issues
        for symbol_name, symbol_info in self.symbol_table.symbols.items():
            # Warning for single character identifiers
            if len(symbol_name) == 1:
                self.warnings.append(f"Single character identifier '{symbol_name}' - consider using more descriptive names")
            
            # Warning for very long identifiers
            if len(symbol_name) > 20:
                self.warnings.append(f"Very long identifier '{symbol_name}' - consider shorter names")
        
        # Check for common naming issues
        reserved_words = ['main', 'void', 'const', 'static', 'extern']
        for symbol_name in self.symbol_table.symbols:
            if symbol_name.lower() in reserved_words:
                self.warnings.append(f"Identifier '{symbol_name}' conflicts with reserved word")