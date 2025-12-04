class CodeGenerator:
    def __init__(self, target='8086'):
        self.target = target
        self.assembly_code = []
        self.register_map = {}
        self.next_register = 0
        self.available_registers = ['ax', 'bx', 'cx', 'dx'] if target == '8086' else ['eax', 'ebx', 'ecx', 'edx']
    
    def generate(self, optimized_code):
        try:
            self.assembly_code = []
            self.register_map = {}
            self.next_register = 0
            
            # Generate assembly header
            if self.target == '8086':
                self.emit_header_8086()
            else:
                self.emit_header_generic()
            
            # Process each instruction
            for instr in optimized_code['instructions']:
                self.generate_instruction(instr)
            
            # Generate footer
            if self.target == '8086':
                self.emit_footer_8086()
            else:
                self.emit_footer_generic()
            
            return {
                'success': True,
                'assembly_code': self.assembly_code,
                'register_usage': self.register_map,
                'target_architecture': self.target
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'assembly_code': self.assembly_code
            }
    
    def get_register(self, var):
        """Allocate or get existing register for variable"""
        if var in self.register_map:
            return self.register_map[var]
        
        if self.next_register < len(self.available_registers):
            reg = self.available_registers[self.next_register]
            self.register_map[var] = reg
            self.next_register += 1
            return reg
        else:
            # Simple spilling - use memory
            offset = (len(self.register_map) + 1) * 2  # 16-bit words
            return f"[bp-{offset}]"
    
    def generate_instruction(self, instr):
        if instr['op'] == '=':
            self.generate_assignment(instr)
        elif instr['op'] in ['+', '-', '*', '/']:
            self.generate_arithmetic(instr)
    
    def generate_assignment(self, instr):
        result_reg = self.get_register(instr['result'])
        
        # Check if arg1 is a constant or variable
        try:
            value = float(instr['arg1'])
            if self.target == '8086':
                self.assembly_code.append(f"    mov {result_reg}, {int(value)}")
            else:
                self.assembly_code.append(f"    load {result_reg}, #{int(value)}")
        except (ValueError, TypeError):
            # It's a variable
            arg_reg = self.get_register(instr['arg1'])
            if self.target == '8086':
                self.assembly_code.append(f"    mov {result_reg}, {arg_reg}")
            else:
                self.assembly_code.append(f"    mov {result_reg}, {arg_reg}")
    
    def generate_arithmetic(self, instr):
        arg1_reg = self.get_register(instr['arg1'])
        arg2_reg = self.get_register(instr['arg2'])
        result_reg = self.get_register(instr['result'])
        
        if self.target == '8086':
            if instr['op'] == '+':
                self.assembly_code.append(f"    mov {result_reg}, {arg1_reg}")
                self.assembly_code.append(f"    add {result_reg}, {arg2_reg}")
            elif instr['op'] == '-':
                self.assembly_code.append(f"    mov {result_reg}, {arg1_reg}")
                self.assembly_code.append(f"    sub {result_reg}, {arg2_reg}")
            elif instr['op'] == '*':
                self.assembly_code.append(f"    mov ax, {arg1_reg}")
                self.assembly_code.append(f"    mul {arg2_reg}")
                self.assembly_code.append(f"    mov {result_reg}, ax")
            elif instr['op'] == '/':
                self.assembly_code.append(f"    mov ax, {arg1_reg}")
                self.assembly_code.append(f"    xor dx, dx")
                self.assembly_code.append(f"    div {arg2_reg}")
                self.assembly_code.append(f"    mov {result_reg}, ax")
        else:
            # Generic assembly
            if instr['op'] == '+':
                self.assembly_code.append(f"    add {result_reg}, {arg1_reg}, {arg2_reg}")
            elif instr['op'] == '-':
                self.assembly_code.append(f"    sub {result_reg}, {arg1_reg}, {arg2_reg}")
            elif instr['op'] == '*':
                self.assembly_code.append(f"    mul {result_reg}, {arg1_reg}, {arg2_reg}")
            elif instr['op'] == '/':
                self.assembly_code.append(f"    div {result_reg}, {arg1_reg}, {arg2_reg}")
    
    def emit_header_8086(self):
        self.assembly_code.extend([
            ".model small",
            ".stack 100h",
            ".data",
            ".code",
            "main proc",
            "    push bp",
            "    mov bp, sp"
        ])
    
    def emit_footer_8086(self):
        self.assembly_code.extend([
            "    mov sp, bp",
            "    pop bp",
            "    mov ax, 4c00h",
            "    int 21h",
            "main endp",
            "end main"
        ])
    
    def emit_header_generic(self):
        self.assembly_code.extend([
            "# Generated Assembly Code",
            "main:",
        ])
    
    def emit_footer_generic(self):
        self.assembly_code.extend([
            "    halt"
        ])