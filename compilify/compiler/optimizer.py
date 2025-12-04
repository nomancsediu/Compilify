class Optimizer:
    def __init__(self):
        self.optimizations_applied = []
    
    def optimize(self, intermediate_code):
        try:
            instructions = intermediate_code['instructions'][:]
            original_count = len(instructions)
            
            # Apply optimizations
            instructions = self.constant_folding(instructions)
            instructions = self.dead_code_elimination(instructions)
            instructions = self.algebraic_simplification(instructions)
            
            optimized_count = len(instructions)
            
            return {
                'success': True,
                'optimized_code': {
                    'instructions': instructions,
                    'temp_count': intermediate_code['temp_count']
                },
                'optimizations_applied': self.optimizations_applied,
                'stats': {
                    'original_instructions': original_count,
                    'optimized_instructions': optimized_count,
                    'reduction': original_count - optimized_count
                },
                'formatted_instructions': self.format_optimized_instructions(instructions)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def format_optimized_instructions(self, instructions):
        formatted = []
        for i, instr in enumerate(instructions):
            if instr['op'] == '=':
                formatted.append(f"{i+1}: {instr['result']} = {instr['arg1']}")
            elif instr.get('arg2'):
                formatted.append(f"{i+1}: {instr['result']} = {instr['arg1']} {instr['op']} {instr['arg2']}")
            else:
                formatted.append(f"{i+1}: {instr['result']} = {instr['op']} {instr['arg1']}")
        return formatted
    
    def constant_folding(self, instructions):
        """Fold constant expressions at compile time"""
        optimized = []
        constants = {}
        
        for instr in instructions:
            op = instr.get('op')
            
            if op == '=':
                # Check if assigning a constant
                arg1 = instr.get('arg1')
                if arg1:
                    try:
                        value = float(arg1)
                        constants[instr['result']] = value
                        optimized.append(instr)
                    except (ValueError, TypeError):
                        optimized.append(instr)
                else:
                    optimized.append(instr)
            
            elif op in ['+', '-', '*', '/']:
                arg1 = instr.get('arg1')
                arg2 = instr.get('arg2')
                
                arg1_val = constants.get(arg1)
                arg2_val = constants.get(arg2)
                
                # Try to parse as numbers if not in constants
                if arg1_val is None and arg1:
                    try:
                        arg1_val = float(arg1)
                    except (ValueError, TypeError):
                        pass
                
                if arg2_val is None and arg2:
                    try:
                        arg2_val = float(arg2)
                    except (ValueError, TypeError):
                        pass
                
                # Perform constant folding if both operands are constants
                if arg1_val is not None and arg2_val is not None:
                    if op == '+':
                        result = arg1_val + arg2_val
                    elif op == '-':
                        result = arg1_val - arg2_val
                    elif op == '*':
                        result = arg1_val * arg2_val
                    elif op == '/' and arg2_val != 0:
                        result = arg1_val / arg2_val
                    else:
                        optimized.append(instr)
                        continue
                    
                    # Replace with constant assignment
                    new_instr = {'op': '=', 'arg1': str(int(result) if result.is_integer() else result), 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    constants[instr['result']] = result
                    self.optimizations_applied.append(f"Constant folding: {arg1_val} {op} {arg2_val} = {result}")
                else:
                    optimized.append(instr)
            else:
                optimized.append(instr)
        
        return optimized
    
    def dead_code_elimination(self, instructions):
        """Remove unused temporary variables"""
        used_vars = set()
        
        # Find all used variables
        for instr in instructions:
            if instr.get('arg1'):
                used_vars.add(instr['arg1'])
            if instr.get('arg2'):
                used_vars.add(instr['arg2'])
        
        # Keep only instructions that define used variables or are assignments to program variables
        optimized = []
        for instr in instructions:
            result = instr.get('result')
            if (result and (result in used_vars or 
                not str(result).startswith('t') or 
                instr['op'] in ['=', 'declare', 'printf'])):
                optimized.append(instr)
            else:
                self.optimizations_applied.append(f"Dead code elimination: removed {instr['op']} instruction")
        
        return optimized
    
    def algebraic_simplification(self, instructions):
        """Apply algebraic simplifications"""
        optimized = []
        
        for instr in instructions:
            op = instr.get('op')
            arg1 = instr.get('arg1')
            arg2 = instr.get('arg2')
            
            if op in ['+', '-', '*', '/']:
                # x + 0 = x, x - 0 = x
                if op in ['+', '-'] and arg2 == '0':
                    new_instr = {'op': '=', 'arg1': arg1, 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} {op} 0 = {arg1}")
                
                # x * 1 = x, x / 1 = x
                elif op in ['*', '/'] and arg2 == '1':
                    new_instr = {'op': '=', 'arg1': arg1, 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} {op} 1 = {arg1}")
                
                # x * 0 = 0
                elif op == '*' and (arg1 == '0' or arg2 == '0'):
                    new_instr = {'op': '=', 'arg1': '0', 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} * {arg2} = 0")
                
                else:
                    optimized.append(instr)
            else:
                optimized.append(instr)
        
        return optimized