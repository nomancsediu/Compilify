class CompilerVisualizer {
    constructor() {
        this.currentPhase = 'lexical';
        this.editor = null;
        this.visualizationContent = document.getElementById('visualizationContent');
        this.phaseButtons = document.querySelectorAll('#phaseButtons button');
        
        this.init();
    }
    
    init() {
        // Initialize Monaco Editor
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
            
            // Add event listeners
            this.phaseButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    // Update active button
                    this.phaseButtons.forEach(btn => {
                        btn.className = 'flex-1 px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-white/5 transition-all duration-200';
                    });
                    e.target.className = 'flex-1 px-3 py-2 text-sm font-medium rounded-md bg-vibrant-blue text-white shadow-glow transition-all duration-200';
                    
                    this.currentPhase = e.target.dataset.phase;
                    this.visualize();
                });
            });
            
            this.editor.onDidChangeModelContent(() => {
                this.visualize();
            });
            
            // Initial visualization
            this.visualize();
        });
    }
    
    async visualize() {
        if (!this.editor) return;
        
        const code = this.editor.getValue().trim();
        if (!code) {
            this.showEmptyState();
            return;
        }
        
        try {
            switch (this.currentPhase) {
                case 'lexical':
                    await this.showLexicalAnalysis(code);
                    break;
                case 'syntax':
                    await this.showSyntaxAnalysis(code);
                    break;
                case 'semantic':
                    await this.showSemanticAnalysis(code);
                    break;
                case 'intermediate':
                    await this.showIntermediateGeneration(code);
                    break;
                case 'optimize':
                    await this.showOptimization(code);
                    break;
                case 'codegen':
                    await this.showCodeGeneration(code);
                    break;
            }
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async showLexicalAnalysis(code) {
        const response = await fetch('/api/lexical/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.renderTokens(data.tokens, data.symbol_table);
        } else {
            this.showError(data.error);
        }
    }
    
    async showSyntaxAnalysis(code) {
        const response = await fetch('/api/syntax/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.renderAST(data.ast);
        } else {
            this.showError(data.error);
        }
    }
    
    async showOutput(code) {
        const response = await fetch('/api/evaluate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        this.renderOutput(data);
    }
    
    async showSemanticAnalysis(code) {
        try {
            const response = await fetch('/api/semantic/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });
            
            const data = await response.json();
            console.log('Semantic API response:', data); // Debug log
            
            if (data.success !== false) {
                this.renderSemanticAnalysis(data);
            } else {
                this.showError(data.error || 'Semantic analysis failed');
            }
        } catch (error) {
            console.error('Semantic analysis error:', error);
            this.showError('Failed to perform semantic analysis: ' + error.message);
        }
    }
    
    async showIntermediateGeneration(code) {
        const response = await fetch('/api/intermediate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.renderIntermediateCode(data);
        } else {
            this.showError(data.error);
        }
    }
    
    async showOptimization(code) {
        try {
            const response = await fetch('/api/optimize/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });
            
            const data = await response.json();
            console.log('Optimization API response:', data); // Debug log
            
            if (data.success !== false) {
                this.renderOptimization(data);
            } else {
                this.showError(data.error || 'Code optimization failed');
            }
        } catch (error) {
            console.error('Optimization error:', error);
            this.showError('Failed to optimize code: ' + error.message);
        }
    }
    
    async showCodeGeneration(code) {
        const response = await fetch('/api/codegen/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, target: '8086' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.renderAssemblyCode(data);
        } else {
            this.showError(data.error);
        }
    }
    
    renderTokens(tokens, symbolTable) {
        const tokenColors = {
            'INT': 'bg-blue-600/20 text-blue-400',
            'FLOAT': 'bg-blue-600/20 text-blue-400',
            'CHAR': 'bg-blue-600/20 text-blue-400',
            'IF': 'bg-purple-600/20 text-purple-400',
            'ELSE': 'bg-purple-600/20 text-purple-400',
            'WHILE': 'bg-purple-600/20 text-purple-400',
            'FOR': 'bg-purple-600/20 text-purple-400',
            'RETURN': 'bg-purple-600/20 text-purple-400',
            'PRINTF': 'bg-orange-600/20 text-orange-400',
            'SCANF': 'bg-orange-600/20 text-orange-400',
            'IDENTIFIER': 'bg-cyan-500/20 text-cyan-300',
            'NUMBER': 'bg-green-500/20 text-green-300',
            'STRING': 'bg-yellow-500/20 text-yellow-300',
            'ASSIGN': 'bg-red-500/20 text-red-300',
            'EQ': 'bg-red-500/20 text-red-300',
            'NE': 'bg-red-500/20 text-red-300',
            'LT': 'bg-red-500/20 text-red-300',
            'LE': 'bg-red-500/20 text-red-300',
            'GT': 'bg-red-500/20 text-red-300',
            'GE': 'bg-red-500/20 text-red-300',
            'PLUS': 'bg-purple-500/20 text-purple-300',
            'MINUS': 'bg-purple-500/20 text-purple-300',
            'MULTIPLY': 'bg-purple-500/20 text-purple-300',
            'DIVIDE': 'bg-purple-500/20 text-purple-300',
            'LPAREN': 'bg-gray-500/20 text-gray-300',
            'RPAREN': 'bg-gray-500/20 text-gray-300',
            'LBRACE': 'bg-gray-500/20 text-gray-300',
            'RBRACE': 'bg-gray-500/20 text-gray-300',
            'SEMICOLON': 'bg-gray-500/20 text-gray-300',
            'COMMA': 'bg-gray-500/20 text-gray-300'
        };
        
        this.visualizationContent.innerHTML = `
            <div class="flex flex-wrap gap-1 lg:gap-2" id="tokensContainer">
            </div>
            ${symbolTable && Object.keys(symbolTable.symbols).length > 0 ? `
                <div class="mt-6 pt-4 border-t border-border-dark">
                    <h4 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Symbol Table</h4>
                    <div class="flex flex-wrap gap-2">
                        ${Object.entries(symbolTable.symbols).map(([name, info]) => 
                            `<div class="px-3 py-1 rounded-full bg-surface-dark border border-token-identifier/30 text-token-identifier text-sm font-mono">${name}</div>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        const container = document.getElementById('tokensContainer');
        
        // Create all tokens first
        tokens.forEach((token, index) => {
            const tokenElement = document.createElement('div');
            const tokenTypeColors = {
                'INT': 'border-token-type/50 text-token-type',
                'FLOAT': 'border-token-type/50 text-token-type',
                'CHAR': 'border-token-type/50 text-token-type',
                'IF': 'border-token-keyword/50 text-token-keyword',
                'ELSE': 'border-token-keyword/50 text-token-keyword',
                'WHILE': 'border-token-keyword/50 text-token-keyword',
                'PRINTF': 'border-token-keyword/50 text-token-keyword',
                'IDENTIFIER': 'border-token-identifier/50 text-token-identifier',
                'NUMBER': 'border-token-literal/50 text-token-literal',
                'STRING': 'border-token-literal/50 text-token-literal',
                'ASSIGN': 'border-token-operator/50 text-token-operator',
                'PLUS': 'border-token-operator/50 text-token-operator',
                'MINUS': 'border-token-operator/50 text-token-operator',
                'MULTIPLY': 'border-token-operator/50 text-token-operator',
                'DIVIDE': 'border-token-operator/50 text-token-operator',
                'LPAREN': 'border-token-punctuation/50 text-token-punctuation',
                'RPAREN': 'border-token-punctuation/50 text-token-punctuation',
                'LBRACE': 'border-token-punctuation/50 text-token-punctuation',
                'RBRACE': 'border-token-punctuation/50 text-token-punctuation',
                'SEMICOLON': 'border-token-punctuation/50 text-token-punctuation'
            };
            
            const colorClass = tokenTypeColors[token.type] || 'border-gray-600 text-gray-400';
            tokenElement.className = `flex items-center bg-surface-dark border rounded-full px-2 lg:px-3 py-1 text-xs lg:text-sm font-mono cursor-pointer hover:bg-vibrant-blue/20 hover:border-vibrant-blue transition-colors duration-200 ${colorClass}`;
            tokenElement.innerHTML = `
                <span class="mr-1 lg:mr-2 text-xs opacity-70">${token.type}</span>
                <span>${token.value}</span>
            `;
            tokenElement.id = `token-${index}`;
            
            // Set initial state
            gsap.set(tokenElement, { 
                opacity: 0, 
                y: -30, 
                scale: 0.5, 
                rotation: -10 
            });
            
            container.appendChild(tokenElement);
        });
        
        // Animate tokens with GSAP
        const tl = gsap.timeline();
        tokens.forEach((token, index) => {
            tl.to(`#token-${index}`, {
                opacity: 1,
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            }, index * 0.1);
            
            // Add bounce effect
            tl.to(`#token-${index}`, {
                y: -5,
                duration: 0.2,
                ease: "power2.out"
            }, index * 0.1 + 0.3);
            
            tl.to(`#token-${index}`, {
                y: 0,
                duration: 0.2,
                ease: "bounce.out"
            }, index * 0.1 + 0.5);
        });
        
        // Add hover effects
        tokens.forEach((token, index) => {
            const element = document.getElementById(`token-${index}`);
            element.addEventListener('mouseenter', () => {
                gsap.to(element, { 
                    scale: 1.1, 
                    y: -3,
                    duration: 0.2, 
                    ease: "power2.out" 
                });
            });
            element.addEventListener('mouseleave', () => {
                gsap.to(element, { 
                    scale: 1, 
                    y: 0,
                    duration: 0.2, 
                    ease: "power2.out" 
                });
            });
        });
    }
    
    renderAST(ast) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-bold text-zinc-100">Abstract Syntax Tree</h3>
                <div class="rounded-lg border border-white/10 p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/30" style="height: 80vh; min-height: 600px;">
                    <div id="d3TreeContainer" class="w-full h-full"></div>
                </div>
            </div>
        `;
        
        this.renderD3Tree(ast);
    }
    
    renderD3Tree(astData) {
        const container = d3.select('#d3TreeContainer');
        container.selectAll('*').remove();
        
        const containerRect = container.node().getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const isSmallMobile = window.innerWidth < 480;
        
        // Responsive dimensions - made much larger for all devices
        const baseWidth = isSmallMobile ? 800 : isMobile ? 1200 : 1400;
        const baseHeight = isSmallMobile ? 600 : isMobile ? 800 : 900;
        
        const width = Math.max(containerRect.width || baseWidth, baseWidth);
        const height = Math.max(containerRect.height || baseHeight, baseHeight);
        
        // Mobile-optimized tree dimensions - increased spacing
        const nodeCount = this.countNodes(astData);
        const treeDepth = this.getTreeDepth(astData);
        
        const nodeSpacing = isSmallMobile ? 150 : isMobile ? 180 : 220;
        const levelSpacing = isSmallMobile ? 120 : isMobile ? 140 : 160;
        
        const dynamicWidth = Math.max(width, nodeCount * nodeSpacing);
        const dynamicHeight = Math.max(height, treeDepth * levelSpacing);
        
        const svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${dynamicWidth} ${dynamicHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('max-width', '100%')
            .style('height', 'auto');
        
        // Create gradient definitions
        const defs = svg.append('defs');
        
        // Node gradients
        const nodeGradients = {
            'DECLARATION': ['#3b82f6', '#1d4ed8'],
            'ASSIGNMENT': ['#eab308', '#ca8a04'],
            'BINARY_OP': ['#8b5cf6', '#7c3aed'],
            'NUMBER': ['#10b981', '#059669'],
            'IDENTIFIER': ['#06b6d4', '#0891b2'],
            'STRING': ['#f97316', '#ea580c'],
            'COMPARISON': ['#ef4444', '#dc2626'],
            'PRINTF': ['#f59e0b', '#d97706']
        };
        
        Object.entries(nodeGradients).forEach(([type, colors]) => {
            const gradient = defs.append('linearGradient')
                .attr('id', `gradient-${type}`)
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '100%').attr('y2', '100%');
            
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', colors[0])
                .attr('stop-opacity', 0.8);
            
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', colors[1])
                .attr('stop-opacity', 0.6);
        });
        
        // Convert AST to D3 hierarchy
        const root = d3.hierarchy(astData);
        
        // Mobile-responsive tree layout - increased margins and separation
        const margin = isSmallMobile ? 60 : isMobile ? 80 : 120;
        const treeLayout = d3.tree()
            .size([dynamicWidth - margin * 2, dynamicHeight - margin])
            .separation((a, b) => {
                const aWidth = this.getNodeWidth(a.data, isMobile, isSmallMobile);
                const bWidth = this.getNodeWidth(b.data, isMobile, isSmallMobile);
                const minSeparation = (aWidth + bWidth) / 2 + (isSmallMobile ? 40 : isMobile ? 50 : 60);
                const scaleFactor = isSmallMobile ? 80 : isMobile ? 100 : 120;
                return a.parent === b.parent ? 
                    Math.max(1.5, minSeparation / scaleFactor) : 
                    Math.max(2.5, minSeparation / (scaleFactor * 0.8));
            });
        
        treeLayout(root);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin / 2})`);
        
        // Draw links with curved paths
        const links = g.selectAll('.link')
            .data(root.links())
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)
            )
            .style('fill', 'none')
            .style('stroke', '#6366f1')
            .style('stroke-width', isSmallMobile ? 1.5 : 2)
            .style('stroke-opacity', 0)
            .style('filter', 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))');
        
        // Draw nodes
        const nodes = g.selectAll('.node')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .style('opacity', 0);
        
        // Mobile-responsive node dimensions - made even larger
        const nodeHeight = isSmallMobile ? 40 : isMobile ? 44 : 48;
        const borderRadius = isSmallMobile ? 8 : 10;
        
        // Add node backgrounds
        nodes.append('rect')
            .attr('width', d => this.getNodeWidth(d.data, isMobile, isSmallMobile))
            .attr('height', nodeHeight)
            .attr('x', d => -this.getNodeWidth(d.data, isMobile, isSmallMobile) / 2)
            .attr('y', -nodeHeight / 2)
            .attr('rx', borderRadius)
            .attr('ry', borderRadius)
            .style('fill', d => `url(#gradient-${d.data.type})`)
            .style('stroke', d => this.getNodeColor(d.data.type))
            .style('stroke-width', isSmallMobile ? 1 : 1.5)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
        
        // Mobile-responsive text - increased font size more
        const fontSize = isSmallMobile ? '13px' : isMobile ? '14px' : '16px';
        
        nodes.append('text')
            .attr('dy', 3)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-family', 'monospace')
            .style('font-size', fontSize)
            .style('font-weight', 'bold')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)')
            .text(d => this.getNodeText(d.data, isMobile, isSmallMobile));
        
        // Animate everything
        this.animateD3Tree(links, nodes);
    }
    
    getNodeText(node, isMobile = false, isSmallMobile = false) {
        if (node.value !== null && node.value !== undefined) {
            if (typeof node.value === 'object' && node.value !== null) {
                if (node.value.name && node.value.type) {
                    if (isSmallMobile) {
                        return `${node.value.type.substring(0, 3)} ${node.value.name}`;
                    }
                    return `${node.value.type} ${node.value.name}`;
                }
            } else {
                if (node.type === 'ASSIGNMENT') {
                    return `${node.value} =`;
                } else if (node.type === 'BINARY_OP') {
                    return node.value;
                } else {
                    const text = `${node.type}: ${node.value}`;
                    if (isSmallMobile && text.length > 12) {
                        return `${node.type.substring(0, 4)}: ${node.value}`;
                    }
                    return text;
                }
            }
        }
        const nodeType = isSmallMobile && node.type.length > 8 ? 
            node.type.substring(0, 8) : node.type;
        return nodeType;
    }
    
    getNodeWidth(node, isMobile = false, isSmallMobile = false) {
        const text = this.getNodeText(node, isMobile, isSmallMobile);
        const charWidth = isSmallMobile ? 9 : isMobile ? 10 : 11;
        const padding = isSmallMobile ? 20 : isMobile ? 22 : 24;
        const minWidth = isSmallMobile ? 90 : isMobile ? 100 : 110;
        const maxWidth = isSmallMobile ? 180 : isMobile ? 200 : 240;
        return Math.max(minWidth, Math.min(maxWidth, text.length * charWidth + padding));
    }
    
    countNodes(node) {
        if (!node) return 0;
        let count = 1;
        if (node.children) {
            node.children.forEach(child => {
                count += this.countNodes(child);
            });
        }
        return count;
    }
    
    getTreeDepth(node, depth = 0) {
        if (!node || !node.children || node.children.length === 0) {
            return depth + 1;
        }
        let maxDepth = depth + 1;
        node.children.forEach(child => {
            const childDepth = this.getTreeDepth(child, depth + 1);
            maxDepth = Math.max(maxDepth, childDepth);
        });
        return maxDepth;
    }
    
    getNodeColor(type) {
        const colors = {
            'DECLARATION': '#3b82f6',
            'ASSIGNMENT': '#eab308',
            'BINARY_OP': '#8b5cf6',
            'NUMBER': '#10b981',
            'IDENTIFIER': '#06b6d4',
            'STRING': '#f97316',
            'COMPARISON': '#ef4444',
            'PRINTF': '#f59e0b'
        };
        return colors[type] || '#6b7280';
    }
    
    animateD3Tree(links, nodes) {
        // Animate links
        links.transition()
            .duration(1000)
            .delay((d, i) => i * 100)
            .style('stroke-opacity', 0.8)
            .ease(d3.easeBackOut);
        
        // Animate nodes
        nodes.transition()
            .duration(800)
            .delay((d, i) => i * 150)
            .style('opacity', 1)
            .attr('transform', function(d) {
                return `translate(${d.x}, ${d.y}) scale(1)`;
            })
            .ease(d3.easeBackOut);
        
        // Add hover effects
        nodes.on('mouseenter', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${d.x}, ${d.y}) scale(1.1)`);
        })
        .on('mouseleave', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${d.x}, ${d.y}) scale(1)`);
        });
    }
    
    renderAnimatedTree(ast) {
        const container = document.getElementById('treeContainer');
        const svg = document.getElementById('treeSvg');
        
        if (!container || !svg) return;
        
        // Clear previous content
        container.innerHTML = '<svg id="treeSvg" width="100%" height="100%" class="absolute inset-0"></svg>';
        const newSvg = document.getElementById('treeSvg');
        
        // Calculate tree layout
        const treeData = this.calculateTreeLayout(ast);
        
        // Create nodes and lines
        this.createTreeNodes(container, treeData.nodes);
        this.createTreeLines(newSvg, treeData.lines);
        
        // Animate the tree
        this.animateTree(treeData.nodes, treeData.lines);
    }
    
    calculateTreeLayout(node, x = 400, y = 50, level = 0, nodeId = 0) {
        const nodes = [];
        const lines = [];
        const nodeWidth = 120;
        const levelHeight = 80;
        
        // Create current node
        let nodeText = node.type;
        if (node.value !== null && node.value !== undefined) {
            if (typeof node.value === 'object' && node.value !== null) {
                // Handle declaration nodes
                if (node.value.name && node.value.type) {
                    nodeText = `${node.value.type} ${node.value.name}`;
                } else {
                    nodeText = node.type;
                }
            } else {
                // Handle other nodes with values
                if (node.type === 'ASSIGNMENT') {
                    nodeText = `${node.value} =`;
                } else if (node.type === 'BINARY_OP') {
                    nodeText = node.value;
                } else {
                    nodeText = `${node.type}: ${node.value}`;
                }
            }
        }
        
        const currentNode = {
            id: nodeId++,
            x: x,
            y: y,
            text: nodeText,
            type: node.type
        };
        nodes.push(currentNode);
        
        // Process children
        if (node.children && node.children.length > 0) {
            const childrenWidth = (node.children.length - 1) * nodeWidth * 1.5;
            const startX = x - childrenWidth / 2;
            
            node.children.forEach((child, index) => {
                const childX = startX + index * nodeWidth * 1.5;
                const childY = y + levelHeight;
                
                // Recursive call for child
                const childData = this.calculateTreeLayout(child, childX, childY, level + 1, nodeId);
                nodeId = childData.nodeId;
                
                // Add child nodes and lines
                nodes.push(...childData.nodes);
                lines.push(...childData.lines);
                
                // Add line from current node to child
                lines.push({
                    x1: x,
                    y1: y + 20,
                    x2: childX,
                    y2: childY - 10,
                    id: `line-${currentNode.id}-${childData.nodes[0].id}`
                });
            });
        }
        
        return { nodes, lines, nodeId };
    }
    
    createTreeNodes(container, nodes) {
        nodes.forEach(node => {
            const nodeElement = document.createElement('div');
            
            // Get color based on node type
            const nodeColors = {
                'DECLARATION': 'bg-blue-500/20 text-blue-300 border-blue-500',
                'ASSIGNMENT': 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
                'BINARY_OP': 'bg-purple-500/20 text-purple-300 border-purple-500',
                'NUMBER': 'bg-green-500/20 text-green-300 border-green-500',
                'IDENTIFIER': 'bg-cyan-500/20 text-cyan-300 border-cyan-500',
                'STRING': 'bg-orange-500/20 text-orange-300 border-orange-500'
            };
            
            const colorClass = nodeColors[node.type] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500';
            
            nodeElement.className = `absolute rounded-lg px-3 py-2 text-xs font-mono font-bold border-2 cursor-pointer transition-all duration-300 hover:scale-110 ${colorClass}`;
            nodeElement.id = `node-${node.id}`;
            nodeElement.style.left = `${node.x - 50}px`;
            nodeElement.style.top = `${node.y - 15}px`;
            nodeElement.textContent = node.text;
            
            // Set initial state for animation
            gsap.set(nodeElement, { opacity: 0, scale: 0, rotation: 180 });
            
            container.appendChild(nodeElement);
        });
    }
    
    createTreeLines(svg, lines) {
        lines.forEach(line => {
            const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineElement.setAttribute('x1', line.x1);
            lineElement.setAttribute('y1', line.y1);
            lineElement.setAttribute('x2', line.x2);
            lineElement.setAttribute('y2', line.y2);
            lineElement.setAttribute('stroke', '#6366f1');
            lineElement.setAttribute('stroke-width', '3');
            lineElement.setAttribute('stroke-linecap', 'round');
            lineElement.setAttribute('id', line.id);
            
            // Add gradient effect
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            linearGradient.setAttribute('id', `gradient-${line.id}`);
            linearGradient.innerHTML = `
                <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.7" />
            `;
            gradient.appendChild(linearGradient);
            svg.appendChild(gradient);
            
            lineElement.setAttribute('stroke', `url(#gradient-${line.id})`);
            
            // Set initial state for animation
            gsap.set(lineElement, { opacity: 0, strokeDasharray: '8,4', strokeDashoffset: 20 });
            
            svg.appendChild(lineElement);
        });
    }
    
    animateTree(nodes, lines) {
        const tl = gsap.timeline();
        
        // Animate nodes in levels
        const nodesByLevel = {};
        nodes.forEach(node => {
            const level = Math.floor(node.y / 80);
            if (!nodesByLevel[level]) nodesByLevel[level] = [];
            nodesByLevel[level].push(`#node-${node.id}`);
        });
        
        // Animate each level
        Object.keys(nodesByLevel).sort((a, b) => a - b).forEach((level, index) => {
            tl.to(nodesByLevel[level], {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }, index * 0.3);
        });
        
        // Animate lines
        tl.to(lines.map(line => `#${line.id}`), {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out"
        }, 0.5);
        
        // Add hover animations
        nodes.forEach(node => {
            const element = document.getElementById(`node-${node.id}`);
            if (element) {
                element.addEventListener('mouseenter', () => {
                    gsap.to(element, { scale: 1.1, duration: 0.2, ease: "power2.out" });
                });
                element.addEventListener('mouseleave', () => {
                    gsap.to(element, { scale: 1, duration: 0.2, ease: "power2.out" });
                });
            }
        });
    }
    
    renderOutput(data) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-bold text-zinc-100">Output</h3>
                <div class="rounded-lg border border-white/10 p-4">
                    <div id="outputContainer"></div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('outputContainer');
        
        if (data.success) {
            container.innerHTML = `
                <div id="outputResult" class="text-green-300 text-lg font-mono">
                    Result: ${data.result}
                </div>
                ${Object.keys(data.variables).length > 0 ? `
                    <div id="variablesSection" class="mt-4 text-zinc-300">
                        <h4 class="font-bold mb-2">Variables:</h4>
                        <div id="variablesList">
                            ${Object.entries(data.variables).map(([key, value], index) => 
                                `<div id="var-${index}" class="font-mono py-1 px-2 rounded bg-green-500/10 mb-1">${key} = ${value}</div>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
            
            // Animate output
            const tl = gsap.timeline();
            tl.from('#outputResult', {
                scale: 0,
                rotation: 360,
                duration: 0.8,
                ease: "back.out(1.7)"
            });
            
            if (Object.keys(data.variables).length > 0) {
                tl.from('#variablesSection', {
                    y: 30,
                    opacity: 0,
                    duration: 0.5
                }, 0.5);
                
                Object.keys(data.variables).forEach((_, index) => {
                    tl.from(`#var-${index}`, {
                        x: -50,
                        opacity: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    }, 0.8 + index * 0.1);
                });
            }
        } else {
            container.innerHTML = `
                <div id="errorResult" class="text-red-300 text-lg font-mono">
                    Error: ${data.error}
                </div>
            `;
            
            gsap.from('#errorResult', {
                scale: 0,
                rotation: -10,
                duration: 0.6,
                ease: "back.out(1.7)"
            });
        }
    }
    
    renderSemanticAnalysis(data) {
        console.log('Semantic data:', data); // Debug log
        
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
        
        // Animate containers
        tl.from('#symbolTable', { x: -50, opacity: 0, duration: 0.6, ease: "power2.out" })
          .from('#analysisResults', { x: 50, opacity: 0, duration: 0.6, ease: "power2.out" }, 0.2);
        
        // Animate symbol entries
        const symbols = (data.symbol_table && data.symbol_table.symbols) || {};
        Object.keys(symbols).forEach((_, index) => {
            tl.from(`#symbol-${index}`, {
                x: -50,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            }, 0.8 + index * 0.1);
        });
        
        // Animate results
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
    
    renderIntermediateCode(data) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col gap-4">
                <h3 class="text-xl font-semibold tracking-tight text-white">Intermediate Code (Three-Address Code)</h3>
                <div class="font-mono text-sm text-zinc-300">
                    ${data.instructions.map((instr, index) => 
                        `<div id="instr-${index}" class="py-1 hover:bg-white/5 px-2 rounded mb-1 border-l-2 border-vibrant-blue/30">${instr}</div>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Animate instructions
        this.animateInstructions(data.instructions);
    }
    
    animateInstructions(instructions, prefix = 'instr') {
        const tl = gsap.timeline();
        
        instructions.forEach((_, index) => {
            tl.from(`#${prefix}-${index}`, {
                x: -100,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            }, index * 0.1)
            .to(`#${prefix}-${index}`, {
                borderLeftColor: '#3B82F6',
                duration: 0.2
            }, index * 0.1 + 0.2);
        });
        
        // Add hover effects
        instructions.forEach((_, index) => {
            const element = document.getElementById(`${prefix}-${index}`);
            if (element) {
                element.addEventListener('mouseenter', () => {
                    gsap.to(element, {
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        scale: 1.02,
                        duration: 0.2
                    });
                });
                element.addEventListener('mouseleave', () => {
                    gsap.to(element, {
                        backgroundColor: 'transparent',
                        scale: 1,
                        duration: 0.2
                    });
                });
            }
        });
    }
    
    renderOptimization(data) {
        const hasOptimizations = data.optimizations_applied && data.optimizations_applied.length > 0;
        const reductionPercent = data.stats ? Math.round((data.stats.reduction / data.stats.original_instructions) * 100) : 0;
        
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-semibold tracking-tight text-white">Code Optimization</h3>
                    ${data.stats ? `
                        <div class="flex items-center gap-2 text-sm">
                            <span class="px-2 py-1 rounded bg-blue-500/20 text-blue-300">${data.stats.original_instructions} → ${data.stats.optimized_instructions}</span>
                            ${data.stats.reduction > 0 ? 
                                `<span class="px-2 py-1 rounded bg-green-500/20 text-green-300">-${reductionPercent}%</span>` :
                                `<span class="px-2 py-1 rounded bg-gray-500/20 text-gray-300">No reduction</span>`
                            }
                        </div>
                    ` : ''}
                </div>
                
                ${hasOptimizations ? `
                    <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                        <h4 class="font-bold text-green-300 mb-2">Optimizations Applied:</h4>
                        <div class="space-y-1">
                            ${data.optimizations_applied.map((opt, index) => 
                                `<div id="optimization-${index}" class="text-sm text-green-200 pl-2">• ${opt}</div>`
                            ).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                        <div class="text-yellow-300 font-semibold">No optimizations applied</div>
                        <div class="text-yellow-200 text-sm mt-1">Code is already optimal or no optimization opportunities found</div>
                    </div>
                `}
                
                <div class="rounded-lg border border-white/10 p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
                    <h4 class="font-bold text-zinc-200 mb-3">Optimized Three-Address Code</h4>
                    <div class="font-mono text-sm text-zinc-300">
                        ${data.formatted_instructions && data.formatted_instructions.length > 0 ? 
                            data.formatted_instructions.map((instr, index) => 
                                `<div id="opt-instr-${index}" class="py-1 hover:bg-white/5 px-2 rounded mb-1 border-l-2 border-green-500/30 transition-colors">${instr}</div>`
                            ).join('') :
                            '<div class="text-center py-8 text-gray-400">No optimized code generated</div>'
                        }
                    </div>
                </div>
            </div>
        `;
        
        // Animate optimizations
        if (hasOptimizations) {
            data.optimizations_applied.forEach((_, index) => {
                gsap.from(`#optimization-${index}`, {
                    x: -20,
                    opacity: 0,
                    duration: 0.3,
                    delay: index * 0.1
                });
            });
        }
        
        // Animate instructions
        if (data.formatted_instructions && data.formatted_instructions.length > 0) {
            this.animateInstructions(data.formatted_instructions, 'opt-instr');
        }
    }
    
    renderAssemblyCode(data) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col gap-4">
                <h3 class="text-lg font-bold text-zinc-100">Assembly Code (${data.target_architecture.toUpperCase()})</h3>
                <div class="rounded-lg border border-white/10 p-4 overflow-auto">
                    <div class="font-mono text-sm text-zinc-300">
                        ${data.assembly_code.map(line => 
                            `<div class="py-1 hover:bg-white/5 px-2 rounded">${line}</div>`
                        ).join('')}
                    </div>
                </div>
                <div class="rounded-lg border border-white/10 p-4">
                    <h4 class="font-bold text-zinc-200 mb-2">Register Allocation</h4>
                    <div class="text-zinc-300 text-sm">
                        ${Object.entries(data.register_usage).map(([var_, reg]) => 
                            `<span class="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded mr-2 mb-1">${var_} → ${reg}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
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
    

}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CompilerVisualizer();
});