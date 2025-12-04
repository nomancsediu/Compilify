class Optimizer:
    def __init__(self):
        self.optimizations_applied = []
    
    def optimize(self, intermediate_code):
        try:
            instructions = intermediate_code['instructions'][:]
            original_count = len(instructions)
            self.optimizations_applied = []  # Reset for each optimization run
            
            # Apply multiple optimization passes
            prev_count = len(instructions)
            for pass_num in range(3):  # Multiple passes for better optimization
                instructions = self.constant_folding(instructions)
                instructions = self.algebraic_simplification(instructions)
                instructions = self.copy_propagation(instructions)
                instructions = self.dead_code_elimination(instructions)
                
                # If no change in this pass, break
                if len(instructions) == prev_count:
                    break
                prev_count = len(instructions)
            
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
                    'reduction': original_count - optimized_count,
                    'passes': pass_num + 1
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
                arg1 = instr.get('arg1')
                if arg1:
                    # Check if arg1 is a known constant
                    if arg1 in constants:
                        # Propagate the constant value
                        constants[instr['result']] = constants[arg1]
                        optimized.append(instr)
                    else:
                        try:
                            value = float(arg1)
                            constants[instr['result']] = value
                            optimized.append(instr)
                        except (ValueError, TypeError):
                            optimized.append(instr)
                else:
                    optimized.append(instr)
            
            elif op in ['+', '-', '*', '/', '==', '!=', '<', '<=', '>', '>=']:
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
                    try:
                        if op == '+':
                            result = arg1_val + arg2_val
                        elif op == '-':
                            result = arg1_val - arg2_val
                        elif op == '*':
                            result = arg1_val * arg2_val
                        elif op == '/' and arg2_val != 0:
                            result = arg1_val / arg2_val
                        elif op == '==':
                            result = 1 if arg1_val == arg2_val else 0
                        elif op == '!=':
                            result = 1 if arg1_val != arg2_val else 0
                        elif op == '<':
                            result = 1 if arg1_val < arg2_val else 0
                        elif op == '<=':
                            result = 1 if arg1_val <= arg2_val else 0
                        elif op == '>':
                            result = 1 if arg1_val > arg2_val else 0
                        elif op == '>=':
                            result = 1 if arg1_val >= arg2_val else 0
                        else:
                            optimized.append(instr)
                            continue
                        
                        # Replace with constant assignment
                        result_str = str(int(result) if isinstance(result, float) and result.is_integer() else result)
                        new_instr = {'op': '=', 'arg1': result_str, 'arg2': None, 'result': instr['result']}
                        optimized.append(new_instr)
                        constants[instr['result']] = result
                        self.optimizations_applied.append(f"Constant folding: {arg1_val} {op} {arg2_val} = {result}")
                    except:
                        optimized.append(instr)
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
    
    def copy_propagation(self, instructions):
        """Propagate copies to eliminate unnecessary assignments"""
        optimized = []
        copies = {}  # Maps variables to their copied values
        
        for instr in instructions:
            op = instr.get('op')
            
            if op == '=' and instr.get('arg1') and not instr.get('arg2'):
                # This is a copy: result = arg1
                arg1 = instr['arg1']
                result = instr['result']
                
                # If arg1 is itself a copy, use the original
                if arg1 in copies:
                    copies[result] = copies[arg1]
                    new_instr = {'op': '=', 'arg1': copies[arg1], 'arg2': None, 'result': result}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Copy propagation: {result} = {copies[arg1]} (instead of {arg1})")
                else:
                    copies[result] = arg1
                    optimized.append(instr)
            else:
                # Replace arguments with their copied values if available
                new_instr = instr.copy()
                if instr.get('arg1') and instr['arg1'] in copies:
                    new_instr['arg1'] = copies[instr['arg1']]
                if instr.get('arg2') and instr['arg2'] in copies:
                    new_instr['arg2'] = copies[instr['arg2']]
                optimized.append(new_instr)
        
        return optimized
    
    def algebraic_simplification(self, instructions):
        """Apply algebraic simplifications"""
        optimized = []
        
        for instr in instructions:
            op = instr.get('op')
            arg1 = instr.get('arg1')
            arg2 = instr.get('arg2')
            
            if op in ['+', '-', '*', '/']:
                # x + 0 = x, 0 + x = x
                if op == '+' and (arg1 == '0' or arg2 == '0'):
                    result_arg = arg2 if arg1 == '0' else arg1
                    new_instr = {'op': '=', 'arg1': result_arg, 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} + {arg2} = {result_arg}")
                
                # x - 0 = x
                elif op == '-' and arg2 == '0':
                    new_instr = {'op': '=', 'arg1': arg1, 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} - 0 = {arg1}")
                
                # x * 1 = x, 1 * x = x
                elif op == '*' and (arg1 == '1' or arg2 == '1'):
                    result_arg = arg2 if arg1 == '1' else arg1
                    new_instr = {'op': '=', 'arg1': result_arg, 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} * {arg2} = {result_arg}")
                
                # x / 1 = x
                elif op == '/' and arg2 == '1':
                    new_instr = {'op': '=', 'arg1': arg1, 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} / 1 = {arg1}")
                
                # x * 0 = 0, 0 * x = 0
                elif op == '*' and (arg1 == '0' or arg2 == '0'):
                    new_instr = {'op': '=', 'arg1': '0', 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} * {arg2} = 0")
                
                # x - x = 0
                elif op == '-' and arg1 == arg2:
                    new_instr = {'op': '=', 'arg1': '0', 'arg2': None, 'result': instr['result']}
                    optimized.append(new_instr)
                    self.optimizations_applied.append(f"Algebraic simplification: {arg1} - {arg1} = 0")
                
                else:
                    optimized.append(instr)
            else:
                optimized.append(instr)
        
        return optimized