class Lexer {
    constructor() {
        this.tokenPatterns = [
            // Literals (order matters - more specific first)
            ['HEX_NUM', /0[xX][0-9a-fA-F]+[lLuU]*/],
            ['OCTAL_NUM', /0[0-7]+[lLuU]*/],
            ['FLOAT_NUM', /\d+\.\d+[fFlL]?/],
            ['FLOAT_EXP', /\d+(\.\d+)?[eE][+-]?\d+[fFlL]?/],
            ['INTEGER', /\d+[lLuU]*/],
            ['STRING', /"([^"\\]|\\.)*"/],
            ['CHAR_LITERAL', /'([^'\\]|\\.)*'/],
            
            // Keywords (C89/C99/C11)
            ['AUTO', /\bauto\b/],
            ['BREAK', /\bbreak\b/],
            ['CASE', /\bcase\b/],
            ['CHAR', /\bchar\b/],
            ['CONST', /\bconst\b/],
            ['CONTINUE', /\bcontinue\b/],
            ['DEFAULT', /\bdefault\b/],
            ['DO', /\bdo\b/],
            ['DOUBLE', /\bdouble\b/],
            ['ELSE', /\belse\b/],
            ['ENUM', /\benum\b/],
            ['EXTERN', /\bextern\b/],
            ['FLOAT', /\bfloat\b/],
            ['FOR', /\bfor\b/],
            ['GOTO', /\bgoto\b/],
            ['IF', /\bif\b/],
            ['INLINE', /\binline\b/],
            ['INT', /\bint\b/],
            ['LONG', /\blong\b/],
            ['REGISTER', /\bregister\b/],
            ['RESTRICT', /\brestrict\b/],
            ['RETURN', /\breturn\b/],
            ['SHORT', /\bshort\b/],
            ['SIGNED', /\bsigned\b/],
            ['SIZEOF', /\bsizeof\b/],
            ['STATIC', /\bstatic\b/],
            ['STRUCT', /\bstruct\b/],
            ['SWITCH', /\bswitch\b/],
            ['TYPEDEF', /\btypedef\b/],
            ['UNION', /\bunion\b/],
            ['UNSIGNED', /\bunsigned\b/],
            ['VOID', /\bvoid\b/],
            ['VOLATILE', /\bvolatile\b/],
            ['WHILE', /\bwhile\b/],
            ['_BOOL', /\b_Bool\b/],
            ['_COMPLEX', /\b_Complex\b/],
            ['_IMAGINARY', /\b_Imaginary\b/],
            
            // Operators (order matters - longer operators first)
            ['LEFT_SHIFT_ASSIGN', /<<=/],
            ['RIGHT_SHIFT_ASSIGN', />>=/],
            ['AND_ASSIGN', /&=/],
            ['OR_ASSIGN', /\|=/],
            ['XOR_ASSIGN', /\^=/],
            ['PLUS_ASSIGN', /\+=/],
            ['MINUS_ASSIGN', /-=/],
            ['MULT_ASSIGN', /\*=/],
            ['DIV_ASSIGN', /\/=/],
            ['MOD_ASSIGN', /%=/],
            ['INCREMENT', /\+\+/],
            ['DECREMENT', /--/],
            ['LEFT_SHIFT', /<</],
            ['RIGHT_SHIFT', />>/],
            ['LESS_EQUAL', /<=/],
            ['GREATER_EQUAL', />=/],
            ['EQUAL', /==/],
            ['NOT_EQUAL', /!=/],
            ['LOGICAL_AND', /&&/],
            ['LOGICAL_OR', /\|\|/],
            ['ARROW', /->/],
            ['ELLIPSIS', /\.\.\./],
            ['ASSIGN', /=/],
            ['PLUS', /\+/],
            ['MINUS', /-/],
            ['MULTIPLY', /\*/],
            ['DIVIDE', /\//],
            ['MODULO', /%/],
            ['LESS_THAN', /</],
            ['GREATER_THAN', />/],
            ['BITWISE_AND', /&/],
            ['BITWISE_OR', /\|/],
            ['BITWISE_XOR', /\^/],
            ['BITWISE_NOT', /~/],
            ['LOGICAL_NOT', /!/],
            ['DOT', /\./],
            ['QUESTION', /\?/],
            ['COLON', /:/],
            
            // Delimiters
            ['LPAREN', /\(/],
            ['RPAREN', /\)/],
            ['LBRACE', /\{/],
            ['RBRACE', /\}/],
            ['LBRACKET', /\[/],
            ['RBRACKET', /\]/],
            ['SEMICOLON', /;/],
            ['COMMA', /,/],
            
            // Preprocessor directives
            ['INCLUDE', /#include\b/],
            ['DEFINE', /#define\b/],
            ['UNDEF', /#undef\b/],
            ['IFDEF', /#ifdef\b/],
            ['IFNDEF', /#ifndef\b/],
            ['IF', /#if\b/],
            ['ELIF', /#elif\b/],
            ['ELSE_PP', /#else\b/],
            ['ENDIF', /#endif\b/],
            ['ERROR', /#error\b/],
            ['WARNING', /#warning\b/],
            ['PRAGMA', /#pragma\b/],
            ['LINE', /#line\b/],
            ['PREPROCESSOR', /#[a-zA-Z_][a-zA-Z0-9_]*/],
            
            // Comments
            ['SINGLE_COMMENT', /\/\/.*$/m],
            ['MULTI_COMMENT', /\/\*[\s\S]*?\*\//],
            
            // Identifiers (must come after keywords)
            ['IDENTIFIER', /[a-zA-Z_][a-zA-Z0-9_]*/],
            
            // Whitespace
            ['WHITESPACE', /\s+/]
        ];
    }

    cleanCode(code) {
        // Step 1: Remove preprocessor directives (lines starting with #)
        let lines = code.split('\n');
        lines = lines.filter(line => !line.trim().startsWith('#'));
        let cleanedCode = lines.join('\n');
        
        // Step 2: Remove multi-line comments (/* ... */)
        cleanedCode = cleanedCode.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Step 3: Remove single-line comments (// ...)
        cleanedCode = cleanedCode.replace(/\/\/.*$/gm, '');
        
        return cleanedCode;
    }

    tokenize(code) {
        // Clean the code first
        const cleanedCode = this.cleanCode(code);
        
        const tokens = [];
        let position = 0;

        while (position < cleanedCode.length) {
            let matched = false;

            for (const [tokenType, pattern] of this.tokenPatterns) {
                // Skip preprocessor and comment patterns since we already cleaned them
                if (['INCLUDE', 'DEFINE', 'UNDEF', 'IFDEF', 'IFNDEF', 'IF', 'ELIF', 'ELSE_PP', 'ENDIF', 'ERROR', 'WARNING', 'PRAGMA', 'LINE', 'PREPROCESSOR', 'SINGLE_COMMENT', 'MULTI_COMMENT'].includes(tokenType)) {
                    continue;
                }
                
                const regex = new RegExp(pattern.source, 'y');
                regex.lastIndex = position;
                const match = regex.exec(cleanedCode);

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
                throw new Error(`Invalid character '${cleanedCode[position]}' at position ${position}`);
            }
        }

        return tokens;
    }

    getTokenCategory(tokenType) {
        const categories = {
            // Literals
            'STRING': 'Literal', 'CHAR_LITERAL': 'Literal', 'FLOAT_NUM': 'Literal',
            'FLOAT_EXP': 'Literal', 'INTEGER': 'Literal', 'HEX_NUM': 'Literal', 'OCTAL_NUM': 'Literal',
            
            // Keywords
            'AUTO': 'Keyword', 'BREAK': 'Keyword', 'CASE': 'Keyword', 'CHAR': 'Keyword',
            'CONST': 'Keyword', 'CONTINUE': 'Keyword', 'DEFAULT': 'Keyword', 'DO': 'Keyword',
            'DOUBLE': 'Keyword', 'ELSE': 'Keyword', 'ENUM': 'Keyword', 'EXTERN': 'Keyword',
            'FLOAT': 'Keyword', 'FOR': 'Keyword', 'GOTO': 'Keyword', 'IF': 'Keyword',
            'INLINE': 'Keyword', 'INT': 'Keyword', 'LONG': 'Keyword', 'REGISTER': 'Keyword',
            'RESTRICT': 'Keyword', 'RETURN': 'Keyword', 'SHORT': 'Keyword', 'SIGNED': 'Keyword',
            'SIZEOF': 'Keyword', 'STATIC': 'Keyword', 'STRUCT': 'Keyword', 'SWITCH': 'Keyword',
            'TYPEDEF': 'Keyword', 'UNION': 'Keyword', 'UNSIGNED': 'Keyword', 'VOID': 'Keyword',
            'VOLATILE': 'Keyword', 'WHILE': 'Keyword', '_BOOL': 'Keyword', '_COMPLEX': 'Keyword',
            '_IMAGINARY': 'Keyword',
            
            // Operators
            'INCREMENT': 'Operator', 'DECREMENT': 'Operator', 'PLUS_ASSIGN': 'Operator',
            'MINUS_ASSIGN': 'Operator', 'MULT_ASSIGN': 'Operator', 'DIV_ASSIGN': 'Operator',
            'MOD_ASSIGN': 'Operator', 'LEFT_SHIFT_ASSIGN': 'Operator', 'RIGHT_SHIFT_ASSIGN': 'Operator',
            'AND_ASSIGN': 'Operator', 'OR_ASSIGN': 'Operator', 'XOR_ASSIGN': 'Operator',
            'LOGICAL_AND': 'Operator', 'LOGICAL_OR': 'Operator', 'EQUAL': 'Operator',
            'NOT_EQUAL': 'Operator', 'LESS_EQUAL': 'Operator', 'GREATER_EQUAL': 'Operator',
            'LEFT_SHIFT': 'Operator', 'RIGHT_SHIFT': 'Operator', 'BITWISE_AND': 'Operator',
            'BITWISE_OR': 'Operator', 'BITWISE_XOR': 'Operator', 'BITWISE_NOT': 'Operator',
            'LOGICAL_NOT': 'Operator', 'ARROW': 'Operator', 'DOT': 'Operator',
            'QUESTION': 'Operator', 'COLON': 'Operator', 'ASSIGN': 'Operator',
            'PLUS': 'Operator', 'MINUS': 'Operator', 'MULTIPLY': 'Operator',
            'DIVIDE': 'Operator', 'MODULO': 'Operator', 'LESS_THAN': 'Operator',
            'GREATER_THAN': 'Operator', 'ELLIPSIS': 'Operator',
            
            // Delimiters
            'LPAREN': 'Delimiter', 'RPAREN': 'Delimiter', 'LBRACE': 'Delimiter',
            'RBRACE': 'Delimiter', 'LBRACKET': 'Delimiter', 'RBRACKET': 'Delimiter',
            'SEMICOLON': 'Delimiter', 'COMMA': 'Delimiter',
            
            // Preprocessor
            'INCLUDE': 'Preprocessor', 'DEFINE': 'Preprocessor', 'UNDEF': 'Preprocessor',
            'IFDEF': 'Preprocessor', 'IFNDEF': 'Preprocessor', 'IF': 'Preprocessor',
            'ELIF': 'Preprocessor', 'ELSE_PP': 'Preprocessor', 'ENDIF': 'Preprocessor',
            'ERROR': 'Preprocessor', 'WARNING': 'Preprocessor', 'PRAGMA': 'Preprocessor',
            'LINE': 'Preprocessor', 'PREPROCESSOR': 'Preprocessor',
            
            // Comments
            'SINGLE_COMMENT': 'Comment', 'MULTI_COMMENT': 'Comment',
            
            // Identifiers
            'IDENTIFIER': 'Identifier'
        };
        
        return categories[tokenType] || 'Unknown';
    }

    getCategoryColor(category) {
        const colors = {
            'Literal': 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50',
            'Keyword': 'bg-violet-500/20 text-violet-300 border-2 border-violet-400/50',
            'Operator': 'bg-orange-500/20 text-orange-300 border-2 border-orange-400/50',
            'Identifier': 'bg-blue-500/20 text-blue-300 border-2 border-blue-400/50',
            'Delimiter': 'bg-gray-500/20 text-gray-300 border-2 border-gray-400/50',
            'Preprocessor': 'bg-pink-500/20 text-pink-300 border-2 border-pink-400/50',
            'Comment': 'bg-green-500/20 text-green-300 border-2 border-green-400/50'
        };
        
        return colors[category] || 'bg-red-500/20 text-red-300 border-2 border-red-400/50';
    }

    getDisplayValue(value, category) {
        // For Identifier and Keyword, show full text without truncation
        if (['Identifier', 'Keyword'].includes(category)) {
            return value;
        }
        
        return value.length > 8 ? value.substring(0, 8) + '...' : value;
    }
}