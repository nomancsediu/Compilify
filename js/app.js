class CompilerVisualizer {
    constructor() {
        this.editor = null;
        this.lexer = new Lexer();
        this.visualizationContent = document.getElementById('visualizationContent');
        this.init();
    }
    
    async init() {
        await this.initEditor();
        this.setupEventListeners();
    }
    
    initEditor() {
        return new Promise((resolve) => {
            require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(document.getElementById('codeEditor'), {
                    value: '',
                    language: 'c',
                    theme: 'vs-dark',
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on'
                });
                
                monaco.editor.defineTheme('custom-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'keyword', foreground: 'c678dd' },
                        { token: 'identifier', foreground: 'abb2bf' },
                        { token: 'number', foreground: '98c379' },
                        { token: 'operator', foreground: 'd19a66' }
                    ],
                    colors: {
                        'editor.background': '#161B22',
                        'editor.foreground': '#abb2bf'
                    }
                });
                monaco.editor.setTheme('custom-dark');
                
                resolve();
            });
        });
    }
    
    setupEventListeners() {
        document.getElementById('visualizeBtn').addEventListener('click', () => {
            this.analyze();
        });
    }
    
    analyze() {
        const code = this.editor.getValue().trim();
        
        if (!code) {
            this.showEmptyState();
            return;
        }
        
        try {
            const tokens = this.lexer.tokenize(code);
            this.renderTokens(tokens);
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    showEmptyState() {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <h3 class="text-xl font-semibold mb-2">Lexical Analyzer Ready!</h3>
                <p class="text-sm opacity-80 max-w-md">
                    Enter C code to see lexical analysis in action
                </p>
            </div>
        `;
    }
    
    showError(message) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center text-red-300">
                <p class="text-lg font-bold">Error</p>
                <p class="text-sm">${message}</p>
            </div>
        `;
    }
    
    renderTokens(tokens) {
        const symbols = new Set();
        const statistics = this.getTokenStatistics(tokens);
        
        this.visualizationContent.innerHTML = `
            <div class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-3 sm:p-4 border border-blue-500/30">
                        <div class="text-xl sm:text-2xl font-bold text-white">${tokens.length}</div>
                        <div class="text-sm text-gray-300">Total Tokens</div>
                    </div>
                    <div class="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-3 sm:p-4 border border-green-500/30">
                        <div class="text-xl sm:text-2xl font-bold text-white">${statistics.identifiers}</div>
                        <div class="text-sm text-gray-300">Identifiers</div>
                    </div>
                    <div class="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-3 sm:p-4 border border-orange-500/30">
                        <div class="text-xl sm:text-2xl font-bold text-white">${statistics.operators}</div>
                        <div class="text-sm text-gray-300">Operators</div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                        Lexical Analysis Result
                    </h3>
                    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3" id="tokensContainer"></div>
                </div>
                
                <div>
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                        Token Table
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="w-full bg-gray-800/50 rounded-lg border border-gray-600">
                            <thead>
                                <tr class="bg-gray-700/50">
                                    <th class="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-200">Lexeme</th>
                                    <th class="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-200 hidden sm:table-cell">Token Type</th>
                                    <th class="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-200">Category</th>
                                    <th class="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-200 hidden lg:table-cell">Position</th>
                                </tr>
                            </thead>
                            <tbody id="tokenTableBody"></tbody>
                        </table>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                        Symbol Table
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="w-full bg-gray-800/50 rounded-lg border border-gray-600">
                            <thead>
                                <tr class="bg-gray-700/50">
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200">Symbol</th>
                                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-200">Type</th>
                                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-200">Occurrences</th>
                                </tr>
                            </thead>
                            <tbody id="symbolTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('tokensContainer');
        const tokenTableBody = document.getElementById('tokenTableBody');
        const symbolTableBody = document.getElementById('symbolTableBody');
        
        const symbolCounts = new Map();
        
        tokens.forEach((token, index) => {
            const category = this.lexer.getTokenCategory(token.type);
            const categoryColor = this.lexer.getCategoryColor(category);
            const displayValue = this.lexer.getDisplayValue(token.value, category);
            
            // Token visualization
            const tokenElement = document.createElement('div');
            tokenElement.className = `flex flex-col items-center justify-center min-w-16 sm:min-w-20 lg:min-w-24 h-16 sm:h-18 lg:h-20 rounded-lg sm:rounded-xl font-mono text-xs cursor-pointer hover:scale-105 transition-all duration-300 ${categoryColor} px-1 sm:px-2`;
            tokenElement.innerHTML = `
                <span class="text-xs opacity-80 mb-1 text-center">${category}</span>
                <span class="font-bold text-sm text-center break-all">${displayValue}</span>
                <span class="text-xs opacity-60 mt-1 text-center">${token.type}</span>
            `;
            
            tokenElement.title = `${token.value} (${token.type}) - ${category}`;
            
            gsap.set(tokenElement, { opacity: 0, scale: 0.5 });
            container.appendChild(tokenElement);
            
            // Token table row
            const tokenRow = document.createElement('tr');
            tokenRow.className = 'border-b border-gray-700/50 hover:bg-gray-700/30';
            tokenRow.innerHTML = `
                <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-gray-300">${token.value}</td>
                <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-gray-300 hidden sm:table-cell">${token.type}</td>
                <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300">
                    <span class="inline-block px-1 sm:px-2 py-1 rounded text-xs ${categoryColor.split(' ')[0]}/30">${category}</span>
                </td>
                <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 text-center hidden lg:table-cell">${token.position}</td>
            `;
            tokenTableBody.appendChild(tokenRow);
            
            // Collect symbols
            if (token.type === 'IDENTIFIER') {
                symbols.add(token.value);
                symbolCounts.set(token.value, (symbolCounts.get(token.value) || 0) + 1);
            }
        });
        
        // Symbol table
        symbols.forEach(symbol => {
            const symbolRow = document.createElement('tr');
            symbolRow.className = 'border-b border-gray-700/50 hover:bg-gray-700/30';
            symbolRow.innerHTML = `
                <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-gray-300">${symbol}</td>
                <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 text-center">
                    <span class="inline-block px-1 sm:px-2 py-1 rounded text-xs bg-blue-600/30 text-blue-300">Identifier</span>
                </td>
                <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 text-center">
                    <span class="inline-block px-1 sm:px-2 py-1 rounded text-xs bg-green-600/30 text-green-300">${symbolCounts.get(symbol)}</span>
                </td>
            `;
            symbolTableBody.appendChild(symbolRow);
        });
        
        // Animate tokens
        gsap.to(container.children, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "back.out(1.7)"
        });
    }
    
    getTokenStatistics(tokens) {
        const stats = {
            identifiers: 0,
            operators: 0,
            keywords: 0,
            literals: 0,
            delimiters: 0,
            preprocessor: 0,
            comments: 0
        };
        
        tokens.forEach(token => {
            const category = this.lexer.getTokenCategory(token.type);
            switch(category) {
                case 'Identifier': stats.identifiers++; break;
                case 'Operator': stats.operators++; break;
                case 'Keyword': stats.keywords++; break;
                case 'Literal': stats.literals++; break;
                case 'Delimiter': stats.delimiters++; break;
                case 'Preprocessor': stats.preprocessor++; break;
                case 'Comment': stats.comments++; break;
            }
        });
        
        return stats;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CompilerVisualizer();
});