class Lexer {
    constructor() {
        this.tokenPatterns = [
            ['NUMBER', /\d+(\.\d*)?/],
            ['INT', /\bint\b/],
            ['FLOAT', /\bfloat\b/],
            ['CHAR', /\bchar\b/],
            ['IF', /\bif\b/],
            ['ELSE', /\belse\b/],
            ['WHILE', /\bwhile\b/],
            ['FOR', /\bfor\b/],
            ['IDENTIFIER', /[a-zA-Z_][a-zA-Z0-9_]*/],
            ['ASSIGN', /=/],
            ['PLUS', /\+/],
            ['MINUS', /-/],
            ['MULTIPLY', /\*/],
            ['DIVIDE', /\//],
            ['LPAREN', /\(/],
            ['RPAREN', /\)/],
            ['SEMICOLON', /;/],
            ['WHITESPACE', /\s+/]
        ];
    }

    tokenize(code) {
        const tokens = [];
        let position = 0;

        while (position < code.length) {
            let matched = false;

            for (const [tokenType, pattern] of this.tokenPatterns) {
                const regex = new RegExp(pattern.source, 'y');
                regex.lastIndex = position;
                const match = regex.exec(code);

                if (match) {
                    if (tokenType !== 'WHITESPACE') {
                        tokens.push({
                            type: tokenType,
                            value: match[0],
                            position: position
                        });
                    }
                    position = regex.lastIndex;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                throw new Error(`Invalid character '${code[position]}' at position ${position}`);
            }
        }

        return tokens;
    }

    getTokenCategory(tokenType) {
        const categories = {
            'NUMBER': 'Number',
            'INT': 'Keyword',
            'FLOAT': 'Keyword',
            'CHAR': 'Keyword',
            'IF': 'Keyword',
            'ELSE': 'Keyword',
            'WHILE': 'Keyword',
            'FOR': 'Keyword',
            'IDENTIFIER': 'Variable',
            'ASSIGN': 'Assignment',
            'PLUS': 'Operator',
            'MINUS': 'Operator', 
            'MULTIPLY': 'Operator',
            'DIVIDE': 'Operator',
            'LPAREN': 'Parenthesis',
            'RPAREN': 'Parenthesis',
            'SEMICOLON': 'Delimiter'
        };
        
        return categories[tokenType] || 'Unknown';
    }

    getCategoryColor(category) {
        const colors = {
            'Number': 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50',
            'Keyword': 'bg-violet-500/20 text-violet-300 border-2 border-violet-400/50',
            'Operator': 'bg-orange-500/20 text-orange-300 border-2 border-orange-400/50',
            'Variable': 'bg-blue-500/20 text-blue-300 border-2 border-blue-400/50',
            'Assignment': 'bg-pink-500/20 text-pink-300 border-2 border-pink-400/50',
            'Parenthesis': 'bg-purple-500/20 text-purple-300 border-2 border-purple-400/50',
            'Delimiter': 'bg-gray-500/20 text-gray-300 border-2 border-gray-400/50'
        };
        
        return colors[category] || 'bg-red-500/20 text-red-300 border-2 border-red-400/50';
    }

    getDisplayValue(value, category) {
        const operatorSymbols = {
            '+': '➕', '-': '➖', '*': '✖️', '/': '➗', '=': '🟰',
            '(': '(', ')': ')', ';': ';'
        };
        
        if (['Operator', 'Assignment', 'Parenthesis', 'Delimiter'].includes(category)) {
            return operatorSymbols[value] || value;
        }
        
        return value;
    }
}