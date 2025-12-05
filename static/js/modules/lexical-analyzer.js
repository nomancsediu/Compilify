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
            this.renderLexicalAnalysis(data.tokens, data.symbol_table, data.errors, data.warnings, data.statistics);
        } else {
            throw new Error(data.error);
        }
    }

    renderLexicalAnalysis(tokens, symbolTable, errors = [], warnings = [], statistics = {}) {
        // Create symbol table with IDs for identifiers
        const identifiers = tokens.filter(token => token.type === 'IDENTIFIER');
        const uniqueIdentifiers = [...new Set(identifiers.map(token => token.value))];
        const symbolTableWithIds = uniqueIdentifiers.map((name, index) => ({
            id: index + 1,
            name: name,
            type: 'IDENTIFIER'
        }));

        this.visualizationContent.innerHTML = `
            <div class="space-y-6">
                <!-- Statistics Panel -->
                <div class="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/20 p-4">
                    <h3 class="text-lg font-bold text-indigo-200 mb-3">Lexical Analysis Statistics</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-400">${statistics.total_tokens || 0}</div>
                            <div class="text-gray-400">Tokens</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-400">${statistics.unique_identifiers || 0}</div>
                            <div class="text-gray-400">Identifiers</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-400">${statistics.skipped_comments || 0}</div>
                            <div class="text-gray-400">Comments</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-400">${statistics.lexical_errors || 0}</div>
                            <div class="text-gray-400">Errors</div>
                        </div>
                    </div>
                </div>

                <!-- Errors and Warnings -->
                ${errors.length > 0 || warnings.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${errors.length > 0 ? `
                            <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                <h4 class="font-bold text-red-300 mb-2 flex items-center">
                                    <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    Lexical Errors (${errors.length})
                                </h4>
                                <div class="space-y-2 max-h-32 overflow-auto">
                                    ${errors.map((error, index) => `
                                        <div class="text-sm text-red-200 font-mono bg-red-900/30 p-2 rounded">
                                            Line ${error.line}, Col ${error.column}: ${error.message}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${warnings.length > 0 ? `
                            <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                <h4 class="font-bold text-yellow-300 mb-2 flex items-center">
                                    <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    Warnings (${warnings.length})
                                </h4>
                                <div class="space-y-2 max-h-32 overflow-auto">
                                    ${warnings.map((warning, index) => `
                                        <div class="text-sm text-yellow-200">${warning}</div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Token Table -->
                <div class="bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-lg border border-white/10 p-4">
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center">
                        <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        Token Table
                    </h3>
                    <div class="overflow-auto max-h-96">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-600">
                                    <th class="text-left py-2 px-3 text-gray-300 font-semibold">#</th>
                                    <th class="text-left py-2 px-3 text-gray-300 font-semibold">Token</th>
                                    <th class="text-left py-2 px-3 text-gray-300 font-semibold">Lexeme</th>
                                    <th class="text-left py-2 px-3 text-gray-300 font-semibold">Category</th>
                                </tr>
                            </thead>
                            <tbody id="tokenTableBody">
                                <!-- Tokens will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Symbol Table -->
                <div class="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-lg border border-green-500/20 p-4">
                    <h3 class="text-lg font-bold text-green-200 mb-4 flex items-center">
                        <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Symbol Table
                    </h3>
                    ${symbolTableWithIds.length > 0 ? `
                        <div class="overflow-auto max-h-96">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-green-600/30">
                                        <th class="text-left py-2 px-3 text-green-300 font-semibold">ID</th>
                                        <th class="text-left py-2 px-3 text-green-300 font-semibold">Symbol</th>
                                        <th class="text-left py-2 px-3 text-green-300 font-semibold">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${symbolTableWithIds.map((symbol, index) => `
                                        <tr id="symbol-${index}" class="border-b border-green-600/10 hover:bg-green-500/10 transition-colors">
                                            <td class="py-2 px-3 text-green-400 font-mono">${symbol.id}</td>
                                            <td class="py-2 px-3 text-green-200 font-mono font-bold">${symbol.name}</td>
                                            <td class="py-2 px-3 text-green-300 text-xs">${symbol.type}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-center py-8 text-green-400/60">
                            <div class="text-2xl mb-2">📝</div>
                            <p>No identifiers found</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
        `;
        
        this.populateTokenTable(tokens);
        this.animateTokenTable(tokens, symbolTableWithIds);
    }

    populateTokenTable(tokens) {
        const tbody = document.getElementById('tokenTableBody');
        
        tokens.forEach((token, index) => {
            const category = this.getTokenCategory(token.type);
            const categoryColor = this.getCategoryColor(category);
            
            const row = document.createElement('tr');
            row.id = `token-row-${index}`;
            row.className = 'border-b border-gray-700/30 hover:bg-white/5 transition-colors';
            row.innerHTML = `
                <td class="py-2 px-3 text-gray-400 font-mono text-xs">${index + 1}</td>
                <td class="py-2 px-3 text-white font-mono font-bold">${token.value}</td>
                <td class="py-2 px-3 text-gray-300 font-mono">${token.type}</td>
                <td class="py-2 px-3">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${categoryColor}">
                        ${category}
                    </span>
                </td>
            `;
            
            // Set initial state for animation
            gsap.set(row, { opacity: 0, x: -50 });
            tbody.appendChild(row);
        });
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
            'Keyword': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
            'Operator': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
            'Literal': 'bg-green-500/20 text-green-300 border border-green-500/30',
            'Identifier': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
            'Punctuation': 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
            'Unknown': 'bg-red-500/20 text-red-300 border border-red-500/30'
        };
        
        return colors[category] || colors['Unknown'];
    }

    animateTokenTable(tokens, symbolTable) {
        const tl = gsap.timeline();
        
        // Animate token table rows
        tokens.forEach((token, index) => {
            tl.to(`#token-row-${index}`, {
                opacity: 1,
                x: 0,
                duration: 0.3,
                ease: "power2.out"
            }, index * 0.05);
        });
        
        // Animate symbol table rows
        symbolTable.forEach((symbol, index) => {
            tl.to(`#symbol-${index}`, {
                opacity: 1,
                x: 0,
                duration: 0.3,
                ease: "power2.out"
            }, 0.5 + index * 0.1);
        });
    }
}