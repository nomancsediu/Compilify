class UIManager {
    constructor(visualizationContent) {
        this.visualizationContent = visualizationContent;
    }

    showEmptyState() {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-1 flex-col">
                <div class="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border-2 border-dashed border-zinc-700 px-6 py-14">
                    <div class="flex max-w-md flex-col items-center gap-2">
                        <p class="text-center text-lg font-bold leading-tight tracking-[-0.015em] text-zinc-100">Enter code to visualize</p>
                        <p class="text-center text-sm font-normal leading-normal text-zinc-400">
                            Write code in the editor and select a compiler phase to see the visualization.
                        </p>
                    </div>
                </div>
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
        // No phase buttons needed - only lexical analysis
        // Auto-trigger lexical analysis
        callback('lexical');
    }
}