class SymbolTable:
    def __init__(self):
        self.symbols = {}
        self.parent = None
    
    def define(self, name, type_, value=None):
        self.symbols[name] = {
            'type': type_,
            'value': value,
            'defined': True
        }
    
    def lookup(self, name):
        if name in self.symbols:
            return self.symbols[name]
        elif self.parent:
            return self.parent.lookup(name)
        return None
    
    def to_dict(self):
        return {
            'symbols': self.symbols,
            'parent': self.parent.to_dict() if self.parent else None
        }

class SemanticAnalyzer:
    def __init__(self):
        self.symbol_table = SymbolTable()
        self.errors = []
        self.warnings = []
    
    def analyze(self, ast):
        try:
            self.visit_node(ast)
            return {
                'success': True,
                'symbol_table': self.symbol_table.to_dict(),
                'errors': self.errors,
                'warnings': self.warnings,
                'type_info': self.get_type_info(ast)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'symbol_table': self.symbol_table.to_dict(),
                'errors': self.errors,
                'warnings': self.warnings
            }
    
    def visit_node(self, node):
        if node['type'] == 'DECLARATION':
            return self.visit_declaration(node)
        elif node['type'] == 'ASSIGNMENT':
            return self.visit_assignment(node)
        elif node['type'] == 'BINARY_OP':
            return self.visit_binary_op(node)
        elif node['type'] == 'COMPARISON':
            return self.visit_comparison(node)
        elif node['type'] == 'NUMBER':
            return 'int' if '.' not in str(node['value']) else 'float'
        elif node['type'] == 'IDENTIFIER':
            return self.visit_identifier(node)
        elif node['type'] == 'STRING':
            return 'char*'
        elif node['type'] == 'PRINTF':
            return self.visit_printf(node)
        elif node['type'] in ['IF', 'IF_ELSE', 'WHILE']:
            return self.visit_control_flow(node)
        else:
            raise ValueError(f"Unknown node type: {node['type']}")
    
    def visit_comparison(self, node):
        left_type = self.visit_node(node['children'][0])
        right_type = self.visit_node(node['children'][1])
        
        # Comparison operations return boolean (int in C)
        if not self.is_compatible_type(left_type, right_type):
            self.errors.append(f"Type mismatch in comparison: {left_type} {node['value']} {right_type}")
        
        return 'int'
    
    def visit_printf(self, node):
        # Check format string and arguments
        if node['children']:
            format_str = node['children'][0]['value']
            # Basic format string validation could be added here
        return 'int'
    
    def visit_control_flow(self, node):
        if node['type'] in ['IF', 'IF_ELSE', 'WHILE']:
            # Check condition type
            condition_type = self.visit_node(node['children'][0])
            if condition_type not in ['int', 'float']:
                self.warnings.append(f"Condition should be numeric type, got {condition_type}")
            
            # Visit body statements
            for child in node['children'][1:]:
                self.visit_node(child)
        
        return 'void'
    
    def visit_declaration(self, node):
        var_info = node['value']
        var_name = var_info['name']
        var_type = var_info['type']
        
        # Check if variable is already defined
        existing = self.symbol_table.lookup(var_name)
        if existing:
            self.errors.append(f"Variable '{var_name}' already declared")
            return 'error'
        
        # If there's an initializer, check type compatibility
        if node['children']:
            expr_type = self.visit_node(node['children'][0])
            if not self.is_compatible_type(var_type, expr_type):
                self.errors.append(f"Type mismatch: cannot assign {expr_type} to {var_type}")
        
        self.symbol_table.define(var_name, var_type)
        return var_type
    
    def visit_assignment(self, node):
        var_name = node['value']
        
        # Check if variable is declared
        existing = self.symbol_table.lookup(var_name)
        if not existing:
            self.errors.append(f"Undeclared variable '{var_name}'")
            return 'error'
        
        expr_type = self.visit_node(node['children'][0])
        
        # Type checking
        if not self.is_compatible_type(existing['type'], expr_type):
            self.errors.append(f"Type mismatch: cannot assign {expr_type} to {existing['type']}")
        
        return existing['type']
    
    def is_compatible_type(self, target_type, source_type):
        """Check if source_type can be assigned to target_type"""
        if target_type == source_type:
            return True
        if target_type == 'float' and source_type in ['int', 'number']:
            return True
        if target_type == 'int' and source_type == 'number':
            return True
        return False
    
    def visit_binary_op(self, node):
        left_type = self.visit_node(node['children'][0])
        right_type = self.visit_node(node['children'][1])
        
        # Type checking
        if left_type != right_type:
            self.errors.append(f"Type mismatch: {left_type} {node['value']} {right_type}")
            return 'error'
        
        return left_type
    
    def visit_identifier(self, node):
        var_name = node['value']
        symbol = self.symbol_table.lookup(var_name)
        
        if not symbol:
            self.errors.append(f"Undefined variable: '{var_name}'")
            return 'error'
        
        return symbol['type']
    
    def get_type_info(self, node):
        """Generate type annotations for visualization"""
        if node['type'] == 'ASSIGNMENT':
            return {
                'node_id': id(node),
                'type': 'assignment',
                'variable': node['value'],
                'expr_type': self.visit_node(node['children'][0])
            }
        elif node['type'] == 'BINARY_OP':
            return {
                'node_id': id(node),
                'type': 'binary_operation',
                'operator': node['value'],
                'result_type': self.visit_node(node)
            }
        return None