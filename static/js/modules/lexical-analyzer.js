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
            <div class="space-y-6">
                <div>
                    <h3 class="text-xl font-bold text-white mb-4">Lexical Analysis Result</h3>
                    <div class="grid grid-cols-6 gap-3" id="tokensContainer"></div>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-4">📋 Token Table</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full bg-gray-800/50 rounded-lg border border-gray-600">
                            <thead>
                                <tr class="bg-gray-700/50">
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600">Lexeme</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600">Token Type</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600">Category</th>
                                </tr>
                            </thead>
                            <tbody id="tokenTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-4">📊 Symbol Table</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full bg-gray-800/50 rounded-lg border border-gray-600">
                            <thead>
                                <tr class="bg-gray-700/50">
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600">Symbol</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600">Type</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600">Value</th>
                                </tr>
                            </thead>
                            <tbody id="symbolTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('tokensContainer');
        const tokenTableBody = document.getElementById('tokenTableBody');
        const symbolTableBody = document.getElementById('symbolTableBody');
        
        const symbols = new Set();
        
        tokens.forEach((token, index) => {
            const tokenElement = document.createElement('div');
            const category = this.getTokenCategory(token.type);
            const categoryColor = this.getCategoryColor(category);
            
            tokenElement.className = `flex flex-col items-center justify-center w-24 h-20 rounded-xl font-mono text-sm cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300 ${categoryColor}`;
            const displayValue = this.getDisplayValue(token.value, category);
            tokenElement.innerHTML = `
                <span class="text-xs opacity-80 mb-1">${category}</span>
                <span class="font-bold text-lg">${displayValue}</span>
                <span class="text-xs opacity-60 mt-1">${token.type}</span>
            `;
            tokenElement.id = `token-${index}`;
            
            gsap.set(tokenElement, { opacity: 0, scale: 0.5, y: 20 });
            container.appendChild(tokenElement);
            
            // Add row to token table
            const tokenRow = document.createElement('tr');
            tokenRow.className = 'border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors';
            tokenRow.innerHTML = `
                <td class="px-4 py-3 text-sm font-mono text-gray-300">${token.value}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-300">${token.type}</td>
                <td class="px-4 py-3 text-sm text-gray-300">
                    <span class="inline-block px-2 py-1 rounded text-xs ${this.getCategoryBadgeColor(category)}">
                        ${category}
                    </span>
                </td>
            `;
            tokenTableBody.appendChild(tokenRow);
            
            // Collect unique identifiers for symbol table
            if (token.type === 'IDENTIFIER') {
                symbols.add(token.value);
            }
        });
        
        // Populate symbol table with unique identifiers
        symbols.forEach(symbol => {
            const symbolRow = document.createElement('tr');
            symbolRow.className = 'border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors';
            symbolRow.innerHTML = `
                <td class="px-4 py-3 text-sm font-mono text-gray-300">${symbol}</td>
                <td class="px-4 py-3 text-sm text-gray-300">
                    <span class="inline-block px-2 py-1 rounded text-xs bg-blue-600/30 text-blue-300">
                        Variable
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-400 italic">undefined</td>
            `;
            symbolTableBody.appendChild(symbolRow);
        });
        
        this.animateTokens(tokens);
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
            'Number': 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50 shadow-emerald-400/20',
            'Keyword': 'bg-violet-500/20 text-violet-300 border-2 border-violet-400/50 shadow-violet-400/20',
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

    getCategoryBadgeColor(category) {
        const colors = {
            'Number': 'bg-emerald-600/30 text-emerald-300',
            'Keyword': 'bg-violet-600/30 text-violet-300',
            'Operator': 'bg-orange-600/30 text-orange-300',
            'Variable': 'bg-blue-600/30 text-blue-300',
            'Assignment': 'bg-pink-600/30 text-pink-300',
            'Parenthesis': 'bg-purple-600/30 text-purple-300',
            'Delimiter': 'bg-gray-600/30 text-gray-300',
            'Unknown': 'bg-red-600/30 text-red-300'
        };
        return colors[category] || colors['Unknown'];
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
        
        // Animate token table rows
        tl.from('#tokenTableBody tr', {
            opacity: 0,
            x: -20,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out"
        }, "-=0.5");
        
        // Animate symbol table rows
        tl.from('#symbolTableBody tr', {
            opacity: 0,
            x: -20,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out"
        }, "-=0.3");
    }
}