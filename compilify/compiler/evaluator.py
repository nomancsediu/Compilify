from .parser import Parser
import html

class Evaluator:
    def __init__(self):
        self.variables = {}
    
    def evaluate(self, code):
        try:
            # Decode HTML entities
            code = html.unescape(code)
            
            parser = Parser()
            
            # Handle multiple statements
            statements = [stmt.strip() for stmt in code.split(';') if stmt.strip()]
            results = []
            
            for stmt in statements:
                if stmt:
                    try:
                        ast = parser.parse(stmt + ';')
                        result = self.evaluate_node(ast)
                        if result is not None:
                            results.append(result)
                    except Exception as e:
                        # Try to continue with other statements
                        results.append(f"Error in '{html.unescape(stmt)}': {str(e)}")
            
            return {
                'success': True,
                'result': results[-1] if results else None,
                'all_results': results,
                'variables': self.variables.copy()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'variables': self.variables.copy()
            }
    
    def evaluate_node(self, node):
        if node['type'] == 'NUMBER':
            return int(node['value']) if isinstance(node['value'], float) and node['value'].is_integer() else node['value']
        
        elif node['type'] == 'IDENTIFIER':
            if node['value'] in self.variables:
                return self.variables[node['value']]
            else:
                raise NameError(f"Variable '{node['value']}' is not defined")
        
        elif node['type'] == 'STRING':
            return node['value'].strip('"')
        
        elif node['type'] == 'BINARY_OP':
            left = self.evaluate_node(node['children'][0])
            right = self.evaluate_node(node['children'][1])
            
            if node['value'] == '+':
                return left + right
            elif node['value'] == '-':
                return left - right
            elif node['value'] == '*':
                return left * right
            elif node['value'] == '/':
                if right == 0:
                    raise ZeroDivisionError("Division by zero")
                return left // right if isinstance(left, int) and isinstance(right, int) else left / right
        
        elif node['type'] == 'COMPARISON':
            left = self.evaluate_node(node['children'][0])
            right = self.evaluate_node(node['children'][1])
            
            if node['value'] == '==':
                return 1 if left == right else 0
            elif node['value'] == '!=':
                return 1 if left != right else 0
            elif node['value'] == '<':
                return 1 if left < right else 0
            elif node['value'] == '<=':
                return 1 if left <= right else 0
            elif node['value'] == '>':
                return 1 if left > right else 0
            elif node['value'] == '>=':
                return 1 if left >= right else 0
        
        elif node['type'] == 'DECLARATION':
            var_info = node['value']
            var_name = var_info['name']
            
            if node['children']:  # Has initializer
                value = self.evaluate_node(node['children'][0])
                self.variables[var_name] = value
                return value
            else:
                # Initialize with default value based on type
                if var_info['type'] == 'int':
                    self.variables[var_name] = 0
                elif var_info['type'] == 'float':
                    self.variables[var_name] = 0.0
                elif var_info['type'] == 'char':
                    self.variables[var_name] = '\0'
                return self.variables[var_name]
        
        elif node['type'] == 'ASSIGNMENT':
            value = self.evaluate_node(node['children'][0])
            self.variables[node['value']] = value
            return value
        
        elif node['type'] == 'PRINTF':
            if node['children']:
                format_str = self.evaluate_node(node['children'][0])
                args = [self.evaluate_node(child) for child in node['children'][1:]]
                
                # Simple printf simulation
                try:
                    # Replace C format specifiers with Python format
                    py_format = format_str.replace('%d', '{}').replace('%f', '{:.2f}').replace('%s', '{}').replace('%c', '{}')
                    result = py_format.format(*args) if args else format_str
                    return result
                except:
                    return format_str
            return ""
        
        elif node['type'] in ['IF', 'IF_ELSE']:
            condition = self.evaluate_node(node['children'][0])
            if condition:  # Non-zero is true in C
                return self.evaluate_node(node['children'][1])
            elif node['type'] == 'IF_ELSE' and len(node['children']) > 2:
                return self.evaluate_node(node['children'][2])
            return None
        
        elif node['type'] == 'WHILE':
            result = None
            iterations = 0
            max_iterations = 1000  # Prevent infinite loops
            
            while iterations < max_iterations:
                condition = self.evaluate_node(node['children'][0])
                if not condition:
                    break
                result = self.evaluate_node(node['children'][1])
                iterations += 1
            
            if iterations >= max_iterations:
                raise RuntimeError("Loop exceeded maximum iterations (possible infinite loop)")
            
            return result
        
        else:
            raise ValueError(f"Unknown node type: {node['type']}")