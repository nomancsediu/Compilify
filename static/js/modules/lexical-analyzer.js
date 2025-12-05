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
            <div class="space-y-4">
                <h3 class="text-xl font-bold text-white mb-4">🔍 Lexical Analysis Result</h3>
                <div class="flex flex-wrap gap-3" id="tokensContainer"></div>
                <div class="mt-6">
                    <h4 class="text-lg font-semibold text-white mb-3">📊 Token Summary</h4>
                    <div id="tokenSummary" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('tokensContainer');
        
        tokens.forEach((token, index) => {
            const tokenElement = document.createElement('div');
            const category = this.getTokenCategory(token.type);
            const categoryColor = this.getCategoryColor(category);
            
            tokenElement.className = `flex flex-col items-center px-4 py-3 rounded-xl font-mono text-sm cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300 ${categoryColor}`;
            const displayValue = this.getDisplayValue(token.value, category);
            tokenElement.innerHTML = `
                <span class="text-xs opacity-80 mb-1">${category}</span>
                <span class="font-bold text-lg">${displayValue}</span>
                <span class="text-xs opacity-60 mt-1">${token.type}</span>
            `;
            tokenElement.id = `token-${index}`;
            
            gsap.set(tokenElement, { opacity: 0, scale: 0.5, y: 20 });
            container.appendChild(tokenElement);
        });
        
        this.renderTokenSummary(tokens);
        this.animateTokens(tokens);
    }



    getTokenCategory(tokenType) {
        const categories = {
            'NUMBER': 'Number',
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
            'Number': 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50 shadow-emerald-400/20',
            'Operator': 'bg-orange-500/20 text-orange-300 border-2 border-orange-400/50 shadow-orange-400/20',
            'Variable': 'bg-blue-500/20 text-blue-300 border-2 border-blue-400/50 shadow-blue-400/20',
            'Assignment': 'bg-pink-500/20 text-pink-300 border-2 border-pink-400/50 shadow-pink-400/20',
            'Parenthesis': 'bg-purple-500/20 text-purple-300 border-2 border-purple-400/50 shadow-purple-400/20',
            'Delimiter': 'bg-gray-500/20 text-gray-300 border-2 border-gray-400/50 shadow-gray-400/20',
            'Unknown': 'bg-red-500/20 text-red-300 border-2 border-red-400/50 shadow-red-400/20'
        };
        
        return colors[category] || colors['Unknown'];
    }

    getDisplayValue(value, category) {
        const operatorSymbols = {
            '+': '➕',
            '-': '➖', 
            '*': '✖️',
            '/': '➗',
            '=': '🟰',
            '(': '(',
            ')': ')',
            ';': ';'
        };
        
        if (category === 'Operator' || category === 'Assignment' || category === 'Parenthesis' || category === 'Delimiter') {
            return operatorSymbols[value] || value;
        }
        
        return value;
    }

    renderTokenSummary(tokens) {
        const summary = {};
        tokens.forEach(token => {
            const category = this.getTokenCategory(token.type);
            summary[category] = (summary[category] || 0) + 1;
        });
        
        const summaryContainer = document.getElementById('tokenSummary');
        Object.entries(summary).forEach(([category, count]) => {
            const summaryElement = document.createElement('div');
            const categoryColor = this.getCategoryColor(category);
            summaryElement.className = `text-center p-3 rounded-lg ${categoryColor}`;
            summaryElement.innerHTML = `
                <div class="text-2xl font-bold">${count}</div>
                <div class="text-sm opacity-80">${category}${count > 1 ? 's' : ''}</div>
            `;
            summaryContainer.appendChild(summaryElement);
        });
    }

    animateTokens(tokens) {
        const tl = gsap.timeline();
        
        tokens.forEach((token, index) => {
            tl.to(`#token-${index}`, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            }, index * 0.15);
        });
        
        // Animate summary after tokens
        tl.from('#tokenSummary > div', {
            opacity: 0,
            y: 20,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.3");
    }
}