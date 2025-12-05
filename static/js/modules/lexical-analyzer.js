class LexicalAnalyzer {
    constructor(visualizationContent) {
        this.visualizationContent = visualizationContent;
    }

    async analyze(code) {
        const response = await fetch('/api/lexical/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.renderTokens(data.tokens);
        } else {
            throw new Error(data.error);
        }
    }

    renderTokens(tokens) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-wrap gap-2" id="tokensContainer">
            </div>
        `;
        
        const container = document.getElementById('tokensContainer');
        
        tokens.forEach((token, index) => {
            const tokenElement = document.createElement('div');
            const category = this.getTokenCategory(token.type);
            const categoryColor = this.getCategoryColor(category);
            
            tokenElement.className = `flex items-center px-3 py-2 rounded-lg font-mono text-sm cursor-pointer hover:scale-105 transition-all duration-200 ${categoryColor}`;
            tokenElement.innerHTML = `
                <span class="mr-2 text-xs opacity-70">${token.type}</span>
                <span class="font-bold">${token.value}</span>
            `;
            tokenElement.id = `token-${index}`;
            
            gsap.set(tokenElement, { opacity: 0, scale: 0.5 });
            container.appendChild(tokenElement);
        });
        
        this.animateTokens(tokens);
    }



    getTokenCategory(tokenType) {
        const categories = {
            // Keywords
            'INT': 'Keyword',
            'FLOAT': 'Keyword', 
            'CHAR': 'Keyword',
            'IF': 'Keyword',
            'ELSE': 'Keyword',
            'WHILE': 'Keyword',
            'FOR': 'Keyword',
            'RETURN': 'Keyword',
            'PRINTF': 'Keyword',
            'SCANF': 'Keyword',
            
            // Operators
            'ASSIGN': 'Operator',
            'PLUS': 'Operator',
            'MINUS': 'Operator', 
            'MULTIPLY': 'Operator',
            'DIVIDE': 'Operator',
            'EQ': 'Operator',
            'NE': 'Operator',
            'LT': 'Operator',
            'LE': 'Operator',
            'GT': 'Operator',
            'GE': 'Operator',
            
            // Literals
            'NUMBER': 'Literal',
            'STRING': 'Literal',
            
            // Identifiers
            'IDENTIFIER': 'Identifier',
            
            // Punctuation
            'LPAREN': 'Punctuation',
            'RPAREN': 'Punctuation',
            'LBRACE': 'Punctuation',
            'RBRACE': 'Punctuation',
            'SEMICOLON': 'Punctuation',
            'COMMA': 'Punctuation'
        };
        
        return categories[tokenType] || 'Unknown';
    }

    getCategoryColor(category) {
        const colors = {
            'Keyword': 'bg-purple-500/30 text-purple-200 border border-purple-400',
            'Operator': 'bg-orange-500/30 text-orange-200 border border-orange-400',
            'Literal': 'bg-green-500/30 text-green-200 border border-green-400',
            'Identifier': 'bg-blue-500/30 text-blue-200 border border-blue-400',
            'Punctuation': 'bg-gray-500/30 text-gray-200 border border-gray-400',
            'Unknown': 'bg-red-500/30 text-red-200 border border-red-400'
        };
        
        return colors[category] || colors['Unknown'];
    }

    animateTokens(tokens) {
        const tl = gsap.timeline();
        
        tokens.forEach((token, index) => {
            tl.to(`#token-${index}`, {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: "back.out(1.7)"
            }, index * 0.1);
        });
    }
}