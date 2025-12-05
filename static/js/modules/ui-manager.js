class UIManager {
    constructor(visualizationContent) {
        this.visualizationContent = visualizationContent;
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
            <div class="flex flex-1 flex-col items-center justify-center gap-4 text-red-300">
                <span class="material-symbols-outlined text-4xl">error</span>
                <p class="text-lg font-bold">Error</p>
                <p class="text-sm text-center">${message}</p>
            </div>
        `;
    }

    setupPhaseButtons(callback) {
        // Only lexical analysis
        callback('lexical');
    }
}