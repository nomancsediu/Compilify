class EditorManager {
    constructor() {
        this.editor = null;
    }

    init() {
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
                    backgroundColor: '#101622',
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
                        useShadows: false
                    },
                    overviewRulerLanes: 0
                });
                
                monaco.editor.defineTheme('custom-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'keyword', foreground: 'c678dd' },
                        { token: 'type', foreground: '56b6c2' },
                        { token: 'identifier', foreground: 'abb2bf' },
                        { token: 'number', foreground: '98c379' },
                        { token: 'string', foreground: '98c379' },
                        { token: 'operator', foreground: 'd19a66' },
                        { token: 'delimiter', foreground: '61afef' }
                    ],
                    colors: {
                        'editor.background': '#161B22',
                        'editor.foreground': '#abb2bf',
                        'editorLineNumber.foreground': '#30363D',
                        'editorCursor.foreground': '#3B82F6',
                        'editor.selectionBackground': '#3B82F620',
                        'scrollbar.shadow': '#00000000',
                        'scrollbarSlider.background': '#30363D',
                        'scrollbarSlider.hoverBackground': '#3B82F640',
                        'scrollbarSlider.activeBackground': '#3B82F660'
                    }
                });
                monaco.editor.setTheme('custom-dark');
                
                resolve(this.editor);
            });
        });
    }

    getValue() {
        return this.editor ? this.editor.getValue().trim() : '';
    }

    onDidChangeModelContent(callback) {
        if (this.editor) {
            this.editor.onDidChangeModelContent(callback);
        }
    }
}