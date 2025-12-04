class SymbolTable:
    def __init__(self):
        self.symbols = {}
        self.parent = None
        self.scope_level = 0
    
    def define(self, name, type_, value=None, line=None):
        self.symbols[name] = {
            'type': type_,
            'value': value,
            'defined': True,
            'used': False,
            'line': line,
            'scope': self.scope_level
        }
    
    def lookup(self, name):
        if name in self.symbols:
            return self.symbols[name]
        elif self.parent:
            return self.parent.lookup(name)
        return None
    
    def mark_used(self, name):
        if name in self.symbols:
            self.symbols[name]['used'] = True
        elif self.parent:
            self.parent.mark_used(name)
    
    def get_unused_variables(self):
        unused = []
        for name, info in self.symbols.items():
            if not info['used']:
                unused.append(name)
        return unused
    
    def to_dict(self):
        return {
            'symbols': self.symbols,
            'scope_level': self.scope_level,
            'parent': self.parent.to_dict() if self.parent else None
        }

class SemanticAnalyzer:
    def __init__(self):
        self.symbol_table = SymbolTable()
        self.errors = []
        self.warnings = []
        self.current_function = None
    
    def analyze(self, ast):
        try:
            self.visit_node(ast)
            
            # Check for unused variables
            unused = self.symbol_table.get_unused_variables()
            for var in unused:
                self.warnings.append(f"Variable '{var}' declared but never used")
            
            return {
                'success': len(self.errors) == 0,
                'symbol_table': self.symbol_table.to_dict(),
                'errors': self.errors,
                'warnings': self.warnings,
                'type_info': self.get_type_info(ast),
                'variable_count': len(self.symbol_table.symbols),
                'scope_info': self.get_scope_info()
            }
        except Exception as e:
            self.errors.append(str(e))
            return {
                'success': False,
                'error': str(e),
                'symbol_table': self.symbol_table.to_dict(),
                'errors': self.errors,
                'warnings': self.warnings
            }
    
    def visit_node(self, node):
        if not node or not isinstance(node, dict) or 'type' not in node:
            return 'void'
            
        node_type = node['type']
        
        if node_type == 'DECLARATION':
            return self.visit_declaration(node)
        elif node_type == 'ASSIGNMENT':
            return self.visit_assignment(node)
        elif node_type == 'BINARY_OP':
            return self.visit_binary_op(node)
        elif node_type == 'COMPARISON':
            return self.visit_comparison(node)
        elif node_type == 'NUMBER':
            value = node.get('value', 0)
            return 'int' if isinstance(value, int) or (isinstance(value, float) and value.is_integer()) else 'float'
        elif node_type == 'IDENTIFIER':
            return self.visit_identifier(node)
        elif node_type == 'STRING':
            return 'char*'
        elif node_type == 'PRINTF':
            return self.visit_printf(node)
        elif node_type in ['IF', 'IF_ELSE', 'WHILE']:
            return self.visit_control_flow(node)
        else:
            self.warnings.append(f"Unknown node type: {node_type}")
            return 'void'
    
    def visit_comparison(self, node):
        children = node.get('children', [])
        if len(children) < 2:
            self.errors.append("Comparison operation requires two operands")
            return 'int'
            
        left_type = self.visit_node(children[0])
        right_type = self.visit_node(children[1])
        
        # Comparison operations return boolean (int in C)
        if not self.is_compatible_type(left_type, right_type) and not self.is_compatible_type(right_type, left_type):
            self.errors.append(f"Type mismatch in comparison: {left_type} {node.get('value', '?')} {right_type}")
        
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
        var_info = node.get('value')
        if not var_info or not isinstance(var_info, dict):
            self.errors.append("Invalid declaration node")
            return 'error'
            
        var_name = var_info.get('name')
        var_type = var_info.get('type')
        
        if not var_name or not var_type:
            self.errors.append("Declaration missing variable name or type")
            return 'error'
        
        # Check if variable is already defined in current scope
        if var_name in self.symbol_table.symbols:
            self.errors.append(f"Variable '{var_name}' already declared in current scope")
            return 'error'
        
        # Validate type
        if var_type not in ['int', 'float', 'char', 'char*']:
            self.errors.append(f"Invalid type '{var_type}'")
            return 'error'
        
        # If there's an initializer, check type compatibility
        init_value = None
        children = node.get('children', [])
        if children:
            expr_type = self.visit_node(children[0])
            if not self.is_compatible_type(var_type, expr_type):
                self.errors.append(f"Type mismatch: cannot assign {expr_type} to {var_type} variable '{var_name}'")
            else:
                init_value = self.get_node_value(children[0])
        
        self.symbol_table.define(var_name, var_type, init_value)
        return var_type
    
    def visit_assignment(self, node):
        var_name = node.get('value')
        if not var_name:
            self.errors.append("Assignment missing variable name")
            return 'error'
        
        # Check if variable is declared
        existing = self.symbol_table.lookup(var_name)
        if not existing:
            self.errors.append(f"Undeclared variable '{var_name}' - must be declared before use")
            return 'error'
        
        # Mark variable as used
        self.symbol_table.mark_used(var_name)
        
        children = node.get('children', [])
        if not children:
            self.errors.append("Assignment missing expression")
            return existing['type']
            
        expr_type = self.visit_node(children[0])
        
        # Type checking
        if not self.is_compatible_type(existing['type'], expr_type):
            self.errors.append(f"Type mismatch: cannot assign {expr_type} to {existing['type']} variable '{var_name}'")
        
        # Update value in symbol table
        if existing:
            existing['value'] = self.get_node_value(children[0])
        
        return existing['type']
    
    def is_compatible_type(self, target_type, source_type):
        """Check if source_type can be assigned to target_type"""
        if target_type == source_type:
            return True
        if target_type == 'float' and source_type in ['int', 'number']:
            return True
        if target_type == 'int' and source_type in ['number', 'float']:
            self.warnings.append(f"Implicit conversion from {source_type} to {target_type} may lose precision")
            return True
        if target_type == 'char*' and source_type == 'string':
            return True
        return False
    
    def visit_binary_op(self, node):
        children = node.get('children', [])
        if len(children) < 2:
            self.errors.append("Binary operation requires two operands")
            return 'error'
            
        left_type = self.visit_node(children[0])
        right_type = self.visit_node(children[1])
        
        # Type checking with compatibility
        if not self.is_compatible_type(left_type, right_type) and not self.is_compatible_type(right_type, left_type):
            self.errors.append(f"Type mismatch in binary operation: {left_type} {node.get('value', '?')} {right_type}")
            return 'error'
        
        # Return the "higher" type (float > int)
        if left_type == 'float' or right_type == 'float':
            return 'float'
        return 'int'
    
    def visit_identifier(self, node):
        var_name = node['value']
        symbol = self.symbol_table.lookup(var_name)
        
        if not symbol:
            self.errors.append(f"Undefined variable: '{var_name}' - must be declared before use")
            return 'error'
        
        # Mark variable as used
        self.symbol_table.mark_used(var_name)
        
        return symbol['type']
    
    def get_node_value(self, node):
        """Extract value from a node for symbol table"""
        if node['type'] == 'NUMBER':
            return node['value']
        elif node['type'] == 'STRING':
            return node['value']
        elif node['type'] == 'IDENTIFIER':
            symbol = self.symbol_table.lookup(node['value'])
            return symbol['value'] if symbol else None
        return None
    
    def get_scope_info(self):
        """Get scope information for visualization"""
        return {
            'current_scope': self.symbol_table.scope_level,
            'total_variables': len(self.symbol_table.symbols),
            'used_variables': len([s for s in self.symbol_table.symbols.values() if s['used']]),
            'unused_variables': len([s for s in self.symbol_table.symbols.values() if not s['used']])
        }
    
    def get_type_info(self, node):
        """Generate type annotations for visualization"""
        type_info = []
        
        def collect_types(n):
            if n['type'] == 'DECLARATION':
                var_info = n['value']
                type_info.append({
                    'node_type': 'declaration',
                    'variable': var_info['name'],
                    'data_type': var_info['type'],
                    'has_initializer': len(n['children']) > 0
                })
            elif n['type'] == 'ASSIGNMENT':
                type_info.append({
                    'node_type': 'assignment',
                    'variable': n['value'],
                    'expr_type': 'expression'
                })
            elif n['type'] == 'BINARY_OP':
                type_info.append({
                    'node_type': 'binary_operation',
                    'operator': n['value'],
                    'result_type': 'numeric'
                })
            
            for child in n.get('children', []):
                collect_types(child)
        
        collect_types(node)
        return type_info