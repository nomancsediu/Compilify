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
        const phaseButtons = document.querySelectorAll('#phaseButtons button');
        
        phaseButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Update active button
                phaseButtons.forEach(btn => {
                    btn.className = 'flex-1 min-w-0 px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-white/5 transition-all duration-200';
                });
                e.target.className = 'flex-1 min-w-0 px-3 py-2 text-sm font-medium rounded-md bg-vibrant-blue text-white shadow-glow transition-all duration-200';
                
                const phase = e.target.dataset.phase;
                callback(phase);
            });
        });
    }
}