from .lexer import Lexer
import re

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
        
        # Create a program root with multiple statements
        statements = []
        
        while self.current_token:
            if self.current_token['type'] in ['INT', 'FLOAT', 'CHAR']:
                statements.append(self.parse_declaration())
            elif self.current_token['type'] == 'IDENTIFIER':
                statements.append(self.parse_assignment())
            elif self.current_token['type'] == 'IF':
                statements.append(self.parse_if_statement())
            elif self.current_token['type'] == 'WHILE':
                statements.append(self.parse_while_statement())
            elif self.current_token['type'] == 'FOR':
                statements.append(self.parse_for_statement())
            elif self.current_token['type'] == 'PRINTF':
                statements.append(self.parse_printf())
            elif self.current_token['type'] == 'SCANF':
                statements.append(self.parse_scanf())
            elif self.current_token['type'] == 'RETURN':
                statements.append(self.parse_return())
            elif self.current_token['type'] == 'LBRACE':
                statements.append(self.parse_block())
            else:
                statements.append(self.parse_expression())
                if self.current_token and self.current_token['type'] == 'SEMICOLON':
                    self.advance()
        
        if len(statements) == 1:
            return statements[0]
        else:
            return ASTNode('PROGRAM', None, statements)
    
    def parse_declaration(self):
        data_type = self.current_token['value']
        self.advance()
        
        if self.current_token and self.current_token['type'] == 'IDENTIFIER':
            identifier = self.current_token['value']
            self.advance()
            
            # Handle array declarations
            if self.current_token and self.current_token['type'] == 'LBRACKET':
                self.advance()
                size = None
                if self.current_token and self.current_token['type'] == 'NUMBER':
                    size = self.current_token['value']
                    self.advance()
                
                if self.current_token and self.current_token['type'] == 'RBRACKET':
                    self.advance()
                
                if self.current_token and self.current_token['type'] == 'SEMICOLON':
                    self.advance()
                
                return ASTNode('ARRAY_DECLARATION', {'type': data_type, 'name': identifier, 'size': size}, [])
            
            elif self.current_token and self.current_token['type'] == 'ASSIGN':
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
                then_stmt = self.parse_single_statement()
                
                if self.current_token and self.current_token['type'] == 'ELSE':
                    self.advance()
                    else_stmt = self.parse_single_statement()
                    return ASTNode('IF_STATEMENT', None, [condition, then_stmt, else_stmt])
                else:
                    return ASTNode('IF_STATEMENT', None, [condition, then_stmt])
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
                body = self.parse_single_statement()
                return ASTNode('WHILE_LOOP', None, [condition, body])
            else:
                raise SyntaxError("Expected ')' after while condition")
        else:
            raise SyntaxError("Expected '(' after 'while'")
    
    def parse_for_statement(self):
        self.advance()  # consume 'for'
        
        if self.current_token and self.current_token['type'] == 'LPAREN':
            self.advance()
            init = self.parse_statement() if self.current_token['type'] != 'SEMICOLON' else None
            if self.current_token and self.current_token['type'] == 'SEMICOLON':
                self.advance()
            
            condition = self.parse_expression() if self.current_token['type'] != 'SEMICOLON' else None
            if self.current_token and self.current_token['type'] == 'SEMICOLON':
                self.advance()
            
            update = self.parse_expression() if self.current_token['type'] != 'RPAREN' else None
            if self.current_token and self.current_token['type'] == 'RPAREN':
                self.advance()
            
            body = self.parse_statement()
            children = [child for child in [init, condition, update, body] if child]
            return ASTNode('FOR_LOOP', None, children)
        else:
            raise SyntaxError("Expected '(' after 'for'")
    
    def parse_scanf(self):
        self.advance()  # consume 'scanf'
        
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
                
                return ASTNode('SCANF', None, args)
            else:
                raise SyntaxError("Expected ')' after scanf arguments")
        else:
            raise SyntaxError("Expected '(' after 'scanf'")
    
    def parse_return(self):
        self.advance()  # consume 'return'
        
        expr = None
        if self.current_token and self.current_token['type'] != 'SEMICOLON':
            expr = self.parse_expression()
        
        if self.current_token and self.current_token['type'] == 'SEMICOLON':
            self.advance()
        
        return ASTNode('RETURN', None, [expr] if expr else [])
    
    def parse_block(self):
        self.advance()  # consume '{'
        
        statements = []
        while self.current_token and self.current_token['type'] != 'RBRACE':
            statements.append(self.parse_single_statement())
        
        if self.current_token and self.current_token['type'] == 'RBRACE':
            self.advance()
        
        return ASTNode('BLOCK', None, statements)
    
    def parse_printf(self):
        self.advance()  # consume 'printf'
        
        if self.current_token and self.current_token['type'] == 'LPAREN':
            self.advance()
            
            args = []
            if self.current_token and self.current_token['type'] == 'STRING':
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
        return self.parse_logical_or()
    
    def parse_logical_or(self):
        left = self.parse_logical_and()
        
        while self.current_token and self.current_token['type'] == 'OR':
            op = self.current_token['value']
            self.advance()
            right = self.parse_logical_and()
            left = ASTNode('LOGICAL_OP', op, [left, right])
        
        return left
    
    def parse_logical_and(self):
        left = self.parse_comparison()
        
        while self.current_token and self.current_token['type'] == 'AND':
            op = self.current_token['value']
            self.advance()
            right = self.parse_comparison()
            left = ASTNode('LOGICAL_OP', op, [left, right])
        
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
        left = self.parse_multiplicative()
        
        while self.current_token and self.current_token['type'] in ['PLUS', 'MINUS']:
            op = self.current_token['value']
            self.advance()
            right = self.parse_multiplicative()
            left = ASTNode('BINARY_OP', op, [left, right])
        
        return left
    
    def parse_multiplicative(self):
        left = self.parse_unary()
        
        while self.current_token and self.current_token['type'] in ['MULTIPLY', 'DIVIDE']:
            op = self.current_token['value']
            self.advance()
            right = self.parse_unary()
            left = ASTNode('BINARY_OP', op, [left, right])
        
        return left
    
    def parse_unary(self):
        if self.current_token and self.current_token['type'] in ['PLUS', 'MINUS']:
            op = self.current_token['value']
            self.advance()
            expr = self.parse_unary()
            return ASTNode('UNARY_OP', op, [expr])
        
        return self.parse_factor()
    
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
            
            # Check for function call
            if self.current_token and self.current_token['type'] == 'LPAREN':
                self.advance()
                args = []
                
                while self.current_token and self.current_token['type'] != 'RPAREN':
                    args.append(self.parse_expression())
                    if self.current_token and self.current_token['type'] == 'COMMA':
                        self.advance()
                    elif self.current_token and self.current_token['type'] != 'RPAREN':
                        break
                
                if self.current_token and self.current_token['type'] == 'RPAREN':
                    self.advance()
                
                return ASTNode('FUNCTION_CALL', value, args)
            else:
                return ASTNode('IDENTIFIER', value)
        
        elif self.current_token['type'] == 'STRING':
            value = self.current_token['value']
            self.advance()
            return ASTNode('STRING', value)
        
        elif self.current_token['type'] == 'LPAREN':
            self.advance()
            expr = self.parse_expression()
            if self.current_token and self.current_token['type'] == 'RPAREN':
                self.advance()
            return expr
        
        elif self.current_token['type'] in ['PLUS', 'MINUS'] and self.position + 1 < len(self.tokens):
            # Handle unary operators
            op = self.current_token['value']
            self.advance()
            expr = self.parse_factor()
            return ASTNode('UNARY_OP', op, [expr])
        
        else:
            raise SyntaxError(f"Unexpected token: {self.current_token['value']}")