class SemanticAnalyzer {
    constructor(visualizationContent) {
        this.visualizationContent = visualizationContent;
    }

    async analyze(code) {
        try {
            const response = await fetch('/api/semantic/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });
            
            const data = await response.json();
            
            if (data.success !== false) {
                this.renderSemanticAnalysis(data);
            } else {
                throw new Error(data.error || 'Semantic analysis failed');
            }
        } catch (error) {
            throw new Error('Failed to perform semantic analysis: ' + error.message);
        }
    }

    renderSemanticAnalysis(data) {
        const symbolTable = data.symbol_table || {};
        const symbols = symbolTable.symbols || {};
        const symbolCount = Object.keys(symbols).length;
        const hasErrors = data.errors && data.errors.length > 0;
        const hasWarnings = data.warnings && data.warnings.length > 0;
        
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-bold text-zinc-100">Semantic Analysis</h3>
                    <div class="flex items-center gap-2 text-sm">
                        <span class="px-2 py-1 rounded bg-blue-500/20 text-blue-300">${symbolCount} Variables</span>
                        ${hasErrors ? `<span class="px-2 py-1 rounded bg-red-500/20 text-red-300">${data.errors.length} Errors</span>` : ''}
                        ${hasWarnings ? `<span class="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">${data.warnings.length} Warnings</span>` : ''}
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div id="symbolTable" class="rounded-lg border border-white/10 p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10">
                        <h4 class="font-bold text-blue-200 mb-3">Symbol Table</h4>
                        ${symbolCount > 0 ? `
                            <div class="space-y-2" id="symbolEntries">
                                ${Object.entries(symbols).map(([name, info], index) => `
                                    <div id="symbol-${index}" class="flex items-center justify-between p-2 rounded bg-surface-dark border border-blue-500/20">
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full ${info.used ? 'bg-green-400' : 'bg-gray-500'}"></span>
                                            <span class="font-mono text-blue-300 font-semibold">${name}</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs">
                                            <span class="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300">${info.type || 'unknown'}</span>
                                            ${info.value !== null && info.value !== undefined ? 
                                                `<span class="px-2 py-1 rounded bg-green-500/20 text-green-300">${info.value}</span>` : 
                                                `<span class="px-2 py-1 rounded bg-gray-500/20 text-gray-400">uninitialized</span>`
                                            }
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-8 text-gray-400">
                                No variables declared
                            </div>
                        `}
                    </div>
                    
                    <div id="analysisResults" class="rounded-lg border border-white/10 p-4">
                        <h4 class="font-bold text-zinc-200 mb-3">Analysis Results</h4>
                        <div id="resultContent" class="space-y-3">
                            ${hasErrors ? `
                                <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                    <strong class="text-red-300">Errors (${data.errors.length})</strong>
                                    <div class="space-y-1 mt-2">
                                        ${data.errors.map((err, index) => `
                                            <div id="error-${index}" class="text-sm text-red-200">• ${err}</div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${hasWarnings ? `
                                <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                                    <strong class="text-yellow-300">Warnings (${data.warnings.length})</strong>
                                    <div class="space-y-1 mt-2">
                                        ${data.warnings.map((warn, index) => `
                                            <div id="warning-${index}" class="text-sm text-yellow-200">• ${warn}</div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${!hasErrors && !hasWarnings ? `
                                <div id="success" class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                                    <div class="text-green-300 font-semibold">✓ Semantic analysis passed</div>
                                    <div class="text-green-200 text-sm mt-1">No errors or warnings found</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.animateSemanticAnalysis(data);
    }
    
    animateSemanticAnalysis(data) {
        const tl = gsap.timeline();
        
        tl.from('#symbolTable', { x: -50, opacity: 0, duration: 0.6, ease: "power2.out" })
          .from('#analysisResults', { x: 50, opacity: 0, duration: 0.6, ease: "power2.out" }, 0.2);
        
        const symbols = (data.symbol_table && data.symbol_table.symbols) || {};
        Object.keys(symbols).forEach((_, index) => {
            tl.from(`#symbol-${index}`, {
                x: -50,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            }, 0.8 + index * 0.1);
        });
        
        if (data.errors && data.errors.length > 0) {
            data.errors.forEach((_, index) => {
                tl.from(`#error-${index}`, {
                    x: -20,
                    opacity: 0,
                    duration: 0.3
                }, 1.2 + index * 0.1);
            });
        }
        
        if (data.warnings && data.warnings.length > 0) {
            data.warnings.forEach((_, index) => {
                tl.from(`#warning-${index}`, {
                    x: -20,
                    opacity: 0,
                    duration: 0.3
                }, 1.4 + index * 0.1);
            });
        }
        
        if ((!data.errors || data.errors.length === 0) && (!data.warnings || data.warnings.length === 0)) {
            tl.from('#success', {
                scale: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            }, 1.2);
        }
    }
}