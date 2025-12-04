from .lexer import Lexer

class ASTNode:
    def __init__(self, type_, value=None, children=None):
        self.type = type_
        self.value = value
        self.children = children or []
    
    def to_dict(self):
        return {
            'type': self.type,
            'value': self.value,
            'children': [child.to_dict() for child in self.children]
        }

class Parser:
    def __init__(self):
        self.tokens = []
        self.position = 0
        self.current_token = None
    
    def parse(self, code):
        lexer = Lexer()
        token_dicts = lexer.tokenize(code)
        self.tokens = token_dicts
        self.position = 0
        self.current_token = self.tokens[0] if self.tokens else None
        
        ast = self.parse_statement()
        return ast.to_dict()
    
    def advance(self):
        self.position += 1
        if self.position < len(self.tokens):
            self.current_token = self.tokens[self.position]
        else:
            self.current_token = None
    
    def parse_statement(self):
        if not self.current_token:
            raise SyntaxError("Empty input")
            
        if self.current_token['type'] in ['INT', 'FLOAT', 'CHAR']:
            return self.parse_declaration()
        elif self.current_token['type'] == 'IDENTIFIER':
            return self.parse_assignment()
        elif self.current_token['type'] == 'IF':
            return self.parse_if_statement()
        elif self.current_token['type'] == 'WHILE':
            return self.parse_while_statement()
        elif self.current_token['type'] == 'PRINTF':
            return self.parse_printf()
        else:
            return self.parse_expression()
    
    def parse_declaration(self):
        data_type = self.current_token['value']
        self.advance()
        
        if self.current_token and self.current_token['type'] == 'IDENTIFIER':
            identifier = self.current_token['value']
            self.advance()
            
            if self.current_token and self.current_token['type'] == 'ASSIGN':
                self.advance()
                expr = self.parse_expression()
                
                if self.current_token and self.current_token['type'] == 'SEMICOLON':
                    self.advance()
                
                return ASTNode('DECLARATION', {'type': data_type, 'name': identifier}, [expr])
            elif self.current_token and self.current_token['type'] == 'SEMICOLON':
                self.advance()
                return ASTNode('DECLARATION', {'type': data_type, 'name': identifier}, [])
            else:
                raise SyntaxError("Expected ';' or '=' after variable declaration")
        else:
            raise SyntaxError("Expected identifier after data type")
    
    def parse_assignment(self):
        identifier = self.current_token['value']
        self.advance()
        
        if self.current_token and self.current_token['type'] == 'ASSIGN':
            self.advance()
            expr = self.parse_expression()
            
            if self.current_token and self.current_token['type'] == 'SEMICOLON':
                self.advance()
            
            return ASTNode('ASSIGNMENT', identifier, [expr])
        else:
            raise SyntaxError("Expected '=' after identifier")
    
    def parse_if_statement(self):
        self.advance()  # consume 'if'
        
        if self.current_token and self.current_token['type'] == 'LPAREN':
            self.advance()
            condition = self.parse_expression()
            
            if self.current_token and self.current_token['type'] == 'RPAREN':
                self.advance()
                then_stmt = self.parse_statement()
                
                if self.current_token and self.current_token['type'] == 'ELSE':
                    self.advance()
                    else_stmt = self.parse_statement()
                    return ASTNode('IF_ELSE', None, [condition, then_stmt, else_stmt])
                else:
                    return ASTNode('IF', None, [condition, then_stmt])
            else:
                raise SyntaxError("Expected ')' after if condition")
        else:
            raise SyntaxError("Expected '(' after 'if'")
    
    def parse_while_statement(self):
        self.advance()  # consume 'while'
        
        if self.current_token and self.current_token['type'] == 'LPAREN':
            self.advance()
            condition = self.parse_expression()
            
            if self.current_token and self.current_token['type'] == 'RPAREN':
                self.advance()
                body = self.parse_statement()
                return ASTNode('WHILE', None, [condition, body])
            else:
                raise SyntaxError("Expected ')' after while condition")
        else:
            raise SyntaxError("Expected '(' after 'while'")
    
    def parse_printf(self):
        self.advance()  # consume 'printf'
        
        if self.current_token and self.current_token['type'] == 'LPAREN':
            self.advance()
            
            args = []
            if self.current_token['type'] == 'STRING':
                args.append(ASTNode('STRING', self.current_token['value']))
                self.advance()
                
                while self.current_token and self.current_token['type'] == 'COMMA':
                    self.advance()
                    args.append(self.parse_expression())
            
            if self.current_token and self.current_token['type'] == 'RPAREN':
                self.advance()
                
                if self.current_token and self.current_token['type'] == 'SEMICOLON':
                    self.advance()
                
                return ASTNode('PRINTF', None, args)
            else:
                raise SyntaxError("Expected ')' after printf arguments")
        else:
            raise SyntaxError("Expected '(' after 'printf'")
    
    def parse_expression(self):
        return self.parse_term()
    
    def parse_term(self):
        left = self.parse_comparison()
        return left
    
    def parse_comparison(self):
        left = self.parse_arithmetic()
        
        while self.current_token and self.current_token['type'] in ['EQ', 'NE', 'LT', 'LE', 'GT', 'GE']:
            op = self.current_token['value']
            self.advance()
            right = self.parse_arithmetic()
            left = ASTNode('COMPARISON', op, [left, right])
        
        return left
    
    def parse_arithmetic(self):
        left = self.parse_factor()
        
        while self.current_token and self.current_token['type'] in ['PLUS', 'MINUS', 'MULTIPLY', 'DIVIDE']:
            op = self.current_token['value']
            self.advance()
            right = self.parse_factor()
            left = ASTNode('BINARY_OP', op, [left, right])
        
        return left
    
    def parse_factor(self):
        if not self.current_token:
            raise SyntaxError("Unexpected end of input")
            
        if self.current_token['type'] == 'NUMBER':
            value = float(self.current_token['value'])
            self.advance()
            return ASTNode('NUMBER', value)
        
        elif self.current_token['type'] == 'IDENTIFIER':
            value = self.current_token['value']
            self.advance()
            return ASTNode('IDENTIFIER', value)
        
        elif self.current_token['type'] == 'LPAREN':
            self.advance()
            expr = self.parse_expression()
            if self.current_token and self.current_token['type'] == 'RPAREN':
                self.advance()
            return expr
        
        else:
            raise SyntaxError(f"Unexpected token: {self.current_token['value']}")