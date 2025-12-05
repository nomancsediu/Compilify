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
                    automaticLayout: true
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
        this.editor.onDidChangeModelContent(() => {
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
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-xl font-semibold mb-2">Ready to Analyze!</h3>
                <p class="text-sm opacity-80 max-w-md">
                    Enter a mathematical expression in the editor<br>
                    <span class="text-emerald-400">Example:</span> <code class="bg-gray-800 px-2 py-1 rounded text-xs">b = a*(c+d)/2 + x*1;</code>
                </p>
            </div>
        `;
    }
    
    showError(message) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center text-red-300">
                <div class="text-4xl mb-4">❌</div>
                <p class="text-lg font-bold">Error</p>
                <p class="text-sm">${message}</p>
            </div>
        `;
    }
    
    renderTokens(tokens) {
        const symbols = new Set();
        
        this.visualizationContent.innerHTML = `
            <div class="space-y-6">
                <div>
                    <h3 class="text-xl font-bold text-white mb-4">Lexical Analysis Result</h3>
                    <div class="grid grid-cols-6 gap-3" id="tokensContainer"></div>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-4">Token Table</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full bg-gray-800/50 rounded-lg border border-gray-600">
                            <thead>
                                <tr class="bg-gray-700/50">
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200">Lexeme</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200">Token Type</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200">Category</th>
                                </tr>
                            </thead>
                            <tbody id="tokenTableBody"></tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-4">Symbol Table</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full bg-gray-800/50 rounded-lg border border-gray-600">
                            <thead>
                                <tr class="bg-gray-700/50">
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-200">Symbol</th>
                                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-200">Type</th>
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
        
        tokens.forEach((token, index) => {
            const category = this.lexer.getTokenCategory(token.type);
            const categoryColor = this.lexer.getCategoryColor(category);
            const displayValue = this.lexer.getDisplayValue(token.value, category);
            
            // Token visualization
            const tokenElement = document.createElement('div');
            tokenElement.className = `flex flex-col items-center justify-center w-24 h-20 rounded-xl font-mono text-sm cursor-pointer hover:scale-110 transition-all duration-300 ${categoryColor}`;
            tokenElement.innerHTML = `
                <span class="text-xs opacity-80 mb-1">${category}</span>
                <span class="font-bold text-lg">${displayValue}</span>
                <span class="text-xs opacity-60 mt-1">${token.type}</span>
            `;
            
            gsap.set(tokenElement, { opacity: 0, scale: 0.5 });
            container.appendChild(tokenElement);
            
            // Token table row
            const tokenRow = document.createElement('tr');
            tokenRow.className = 'border-b border-gray-700/50 hover:bg-gray-700/30';
            tokenRow.innerHTML = `
                <td class="px-4 py-3 text-sm font-mono text-gray-300">${token.value}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-300">${token.type}</td>
                <td class="px-4 py-3 text-sm text-gray-300">
                    <span class="inline-block px-2 py-1 rounded text-xs ${categoryColor.split(' ')[0]}/30">${category}</span>
                </td>
            `;
            tokenTableBody.appendChild(tokenRow);
            
            // Collect symbols
            if (token.type === 'IDENTIFIER') {
                symbols.add(token.value);
            }
        });
        
        // Symbol table
        symbols.forEach(symbol => {
            const symbolRow = document.createElement('tr');
            symbolRow.className = 'border-b border-gray-700/50 hover:bg-gray-700/30';
            symbolRow.innerHTML = `
                <td class="px-4 py-3 text-sm font-mono text-gray-300">${symbol}</td>
                <td class="px-4 py-3 text-sm text-gray-300 text-center">
                    <span class="inline-block px-2 py-1 rounded text-xs bg-blue-600/30 text-blue-300">Variable</span>
                </td>
            `;
            symbolTableBody.appendChild(symbolRow);
        });
        
        // Animate tokens
        gsap.to(container.children, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CompilerVisualizer();
});