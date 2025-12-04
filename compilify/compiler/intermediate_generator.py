class ThreeAddressCode:
    def __init__(self):
        self.instructions = []
        self.temp_counter = 0
    
    def new_temp(self):
        self.temp_counter += 1
        return f"t{self.temp_counter}"
    
    def emit(self, op, arg1=None, arg2=None, result=None):
        instruction = {
            'op': op,
            'arg1': arg1,
            'arg2': arg2,
            'result': result
        }
        self.instructions.append(instruction)
        return instruction
    
    def to_dict(self):
        return {
            'instructions': self.instructions,
            'temp_count': self.temp_counter
        }

class IntermediateGenerator:
    def __init__(self):
        self.code = ThreeAddressCode()
    
    def generate(self, ast):
        try:
            self.visit_node(ast)
            return {
                'success': True,
                'intermediate_code': self.code.to_dict(),
                'instructions': self.format_instructions()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'intermediate_code': self.code.to_dict()
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
            return str(int(node['value']) if isinstance(node['value'], float) and node['value'].is_integer() else node['value'])
        elif node['type'] == 'IDENTIFIER':
            return node['value']
        elif node['type'] == 'STRING':
            return node['value']
        elif node['type'] == 'PRINTF':
            return self.visit_printf(node)
        elif node['type'] in ['IF', 'IF_ELSE', 'WHILE']:
            return self.visit_control_flow(node)
        else:
            raise ValueError(f"Unknown node type: {node['type']}")
    
    def visit_declaration(self, node):
        var_info = node['value']
        var_name = var_info['name']
        
        if node['children']:  # Has initializer
            expr_result = self.visit_node(node['children'][0])
            self.code.emit('=', expr_result, None, var_name)
        else:  # Just declaration
            self.code.emit('declare', var_info['type'], None, var_name)
        
        return var_name
    
    def visit_comparison(self, node):
        left = self.visit_node(node['children'][0])
        right = self.visit_node(node['children'][1])
        temp = self.code.new_temp()
        
        self.code.emit(node['value'], left, right, temp)
        return temp
    
    def visit_printf(self, node):
        args = []
        for child in node['children']:
            args.append(self.visit_node(child))
        
        self.code.emit('printf', args, None, None)
        return None
    
    def visit_control_flow(self, node):
        if node['type'] == 'IF':
            condition = self.visit_node(node['children'][0])
            label_end = f"L{len(self.code.instructions) + 10}"
            
            self.code.emit('if_false', condition, None, label_end)
            self.visit_node(node['children'][1])  # then statement
            self.code.emit('label', None, None, label_end)
            
        elif node['type'] == 'WHILE':
            label_start = f"L{len(self.code.instructions)}"
            label_end = f"L{len(self.code.instructions) + 20}"
            
            self.code.emit('label', None, None, label_start)
            condition = self.visit_node(node['children'][0])
            self.code.emit('if_false', condition, None, label_end)
            self.visit_node(node['children'][1])  # body
            self.code.emit('goto', None, None, label_start)
            self.code.emit('label', None, None, label_end)
        
        return None
    
    def visit_assignment(self, node):
        var_name = node['value']
        expr_result = self.visit_node(node['children'][0])
        
        self.code.emit('=', expr_result, None, var_name)
        return var_name
    
    def visit_binary_op(self, node):
        left = self.visit_node(node['children'][0])
        right = self.visit_node(node['children'][1])
        temp = self.code.new_temp()
        
        self.code.emit(node['value'], left, right, temp)
        return temp
    
    def format_instructions(self):
        formatted = []
        for i, instr in enumerate(self.code.instructions):
            if instr['op'] == '=':
                formatted.append(f"{i+1}: {instr['result']} = {instr['arg1']}")
            elif instr['op'] == 'declare':
                formatted.append(f"{i+1}: declare {instr['arg1']} {instr['result']}")
            elif instr['op'] == 'printf':
                args_str = ', '.join(str(arg) for arg in instr['arg1']) if instr['arg1'] else ''
                formatted.append(f"{i+1}: printf({args_str})")
            elif instr['op'] == 'if_false':
                formatted.append(f"{i+1}: if_false {instr['arg1']} goto {instr['result']}")
            elif instr['op'] == 'goto':
                formatted.append(f"{i+1}: goto {instr['result']}")
            elif instr['op'] == 'label':
                formatted.append(f"{i+1}: {instr['result']}:")
            elif instr['arg2'] is not None:
                formatted.append(f"{i+1}: {instr['result']} = {instr['arg1']} {instr['op']} {instr['arg2']}")
            else:
                formatted.append(f"{i+1}: {instr['result']} = {instr['op']} {instr['arg1']}")
        return formatted