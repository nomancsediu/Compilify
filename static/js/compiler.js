class CompilerVisualizer {
    constructor() {
        this.currentPhase = 'lexical';
        this.visualizationContent = document.getElementById('visualizationContent');
        
        // Initialize modules
        this.editorManager = new EditorManager();
        this.uiManager = new UIManager(this.visualizationContent);
        this.lexicalAnalyzer = new LexicalAnalyzer(this.visualizationContent);
        this.syntaxAnalyzer = new SyntaxAnalyzer(this.visualizationContent);
        this.semanticAnalyzer = new SemanticAnalyzer(this.visualizationContent);
        
        this.init();
    }
    
    async init() {
        // Initialize Monaco Editor
        await this.editorManager.init();
        
        // Setup UI event listeners
        this.uiManager.setupPhaseButtons((phase) => {
            this.currentPhase = phase;
            this.visualize();
        });
        
        // Setup editor change listener
        this.editorManager.onDidChangeModelContent(() => {
            this.visualize();
        });
        
        // Initial visualization
        this.visualize();
    }
    
    async visualize() {
        const code = this.editorManager.getValue();
        if (!code) {
            this.uiManager.showEmptyState();
            return;
        }
        
        try {
            switch (this.currentPhase) {
                case 'lexical':
                    await this.lexicalAnalyzer.analyze(code);
                    break;
                case 'syntax':
                    await this.syntaxAnalyzer.analyze(code);
                    break;
                case 'semantic':
                    await this.semanticAnalyzer.analyze(code);
                    break;
            }
        } catch (error) {
            this.uiManager.showError(error.message);
        }
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CompilerVisualizer();
});