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
            this.renderTokens(data.tokens, data.symbol_table);
        } else {
            throw new Error(data.error);
        }
    }

    renderTokens(tokens, symbolTable) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-wrap gap-1 lg:gap-2" id="tokensContainer">
            </div>
            ${symbolTable && Object.keys(symbolTable.symbols).length > 0 ? `
                <div class="mt-6 pt-4 border-t border-border-dark">
                    <h4 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Symbol Table</h4>
                    <div class="flex flex-wrap gap-2">
                        ${Object.entries(symbolTable.symbols).map(([name, info]) => 
                            `<div class="px-3 py-1 rounded-full bg-surface-dark border border-token-identifier/30 text-token-identifier text-sm font-mono">${name}</div>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        const container = document.getElementById('tokensContainer');
        
        tokens.forEach((token, index) => {
            const tokenElement = document.createElement('div');
            const tokenTypeColors = {
                'INT': 'border-token-type/50 text-token-type',
                'FLOAT': 'border-token-type/50 text-token-type',
                'CHAR': 'border-token-type/50 text-token-type',
                'IF': 'border-token-keyword/50 text-token-keyword',
                'ELSE': 'border-token-keyword/50 text-token-keyword',
                'WHILE': 'border-token-keyword/50 text-token-keyword',
                'PRINTF': 'border-token-keyword/50 text-token-keyword',
                'IDENTIFIER': 'border-token-identifier/50 text-token-identifier',
                'NUMBER': 'border-token-literal/50 text-token-literal',
                'STRING': 'border-token-literal/50 text-token-literal',
                'ASSIGN': 'border-token-operator/50 text-token-operator',
                'PLUS': 'border-token-operator/50 text-token-operator',
                'MINUS': 'border-token-operator/50 text-token-operator',
                'MULTIPLY': 'border-token-operator/50 text-token-operator',
                'DIVIDE': 'border-token-operator/50 text-token-operator',
                'LPAREN': 'border-token-punctuation/50 text-token-punctuation',
                'RPAREN': 'border-token-punctuation/50 text-token-punctuation',
                'LBRACE': 'border-token-punctuation/50 text-token-punctuation',
                'RBRACE': 'border-token-punctuation/50 text-token-punctuation',
                'SEMICOLON': 'border-token-punctuation/50 text-token-punctuation'
            };
            
            const colorClass = tokenTypeColors[token.type] || 'border-gray-600 text-gray-400';
            tokenElement.className = `flex items-center bg-surface-dark border rounded-full px-2 lg:px-3 py-1 text-xs lg:text-sm font-mono cursor-pointer hover:bg-vibrant-blue/20 hover:border-vibrant-blue transition-colors duration-200 ${colorClass}`;
            tokenElement.innerHTML = `
                <span class="mr-1 lg:mr-2 text-xs opacity-70">${token.type}</span>
                <span>${token.value}</span>
            `;
            tokenElement.id = `token-${index}`;
            
            gsap.set(tokenElement, { 
                opacity: 0, 
                y: -30, 
                scale: 0.5, 
                rotation: -10 
            });
            
            container.appendChild(tokenElement);
        });
        
        this.animateTokens(tokens);
    }

    animateTokens(tokens) {
        const tl = gsap.timeline();
        tokens.forEach((token, index) => {
            tl.to(`#token-${index}`, {
                opacity: 1,
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            }, index * 0.1);
            
            tl.to(`#token-${index}`, {
                y: -5,
                duration: 0.2,
                ease: "power2.out"
            }, index * 0.1 + 0.3);
            
            tl.to(`#token-${index}`, {
                y: 0,
                duration: 0.2,
                ease: "bounce.out"
            }, index * 0.1 + 0.5);
        });
        
        tokens.forEach((token, index) => {
            const element = document.getElementById(`token-${index}`);
            element.addEventListener('mouseenter', () => {
                gsap.to(element, { 
                    scale: 1.1, 
                    y: -3,
                    duration: 0.2, 
                    ease: "power2.out" 
                });
            });
            element.addEventListener('mouseleave', () => {
                gsap.to(element, { 
                    scale: 1, 
                    y: 0,
                    duration: 0.2, 
                    ease: "power2.out" 
                });
            });
        });
    }
}