class SyntaxAnalyzer {
    constructor(visualizationContent) {
        this.visualizationContent = visualizationContent;
    }

    async analyze(code) {
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
            throw new Error(data.error);
        }
    }

    renderAST(ast) {
        this.visualizationContent.innerHTML = `
            <div class="flex flex-col gap-2 h-full">
                <h3 class="text-lg font-bold text-zinc-100">Abstract Syntax Tree</h3>
                <div class="rounded-lg border border-white/10 p-2 bg-gradient-to-br from-slate-900/50 to-slate-800/30 flex-1 overflow-auto" style="min-height: 90vh;">
                    <div id="d3TreeContainer" class="min-w-full min-h-full"></div>
                </div>
            </div>
        `;
        
        this.renderD3Tree(ast);
    }

    renderD3Tree(astData) {
        console.log('🌳 Rendering HORIZONTAL AST Tree');
        const container = d3.select('#d3TreeContainer');
        container.selectAll('*').remove();
        
        const isMobile = window.innerWidth < 768;
        const isSmallMobile = window.innerWidth < 480;
        console.log('📱 Device:', isSmallMobile ? 'Small Mobile' : isMobile ? 'Mobile' : 'Desktop');
        
        const nodeCount = this.countNodes(astData);
        
        // Horizontal layout - tree grows sideways, not deep
        const NODE_WIDTH = isSmallMobile ? 200 : isMobile ? 250 : 350;
        const NODE_HEIGHT = isSmallMobile ? 80 : isMobile ? 100 : 120;
        const HORIZONTAL_SPACING = isSmallMobile ? 300 : isMobile ? 400 : 500;
        const VERTICAL_SPACING = isSmallMobile ? 150 : isMobile ? 200 : 250;
        console.log('📏 Node Size:', NODE_WIDTH, 'x', NODE_HEIGHT);
        
        // Calculate canvas size - wide but not too deep
        const canvasWidth = Math.max(1500, nodeCount * HORIZONTAL_SPACING);
        const canvasHeight = Math.max(800, 6 * VERTICAL_SPACING); // Max 6 levels
        
        const dynamicWidth = canvasWidth;
        const dynamicHeight = canvasHeight;
        console.log('🖼️ Canvas Size:', dynamicWidth, 'x', dynamicHeight, '| Nodes:', nodeCount);
        
        const svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${dynamicWidth} ${dynamicHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('max-width', '100%')
            .style('height', 'auto');
        
        const defs = svg.append('defs');
        
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
        
        const root = d3.hierarchy(astData);
        
        const margin = 100;
        // Horizontal tree layout - root on left, children spread right
        const treeLayout = d3.tree()
            .size([dynamicHeight - margin * 2, dynamicWidth - margin * 2])
            .separation((a, b) => {
                // Generous spacing to prevent overlap
                return a.parent === b.parent ? 2 : 3;
            });
        
        treeLayout(root);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin})`);
        
        const links = g.selectAll('.link')
            .data(root.links())
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal()
                .x(d => d.y)  // Swap x and y for horizontal layout
                .y(d => d.x)
            )
            .style('fill', 'none')
            .style('stroke', '#6366f1')
            .style('stroke-width', isSmallMobile ? 2 : 3)
            .style('stroke-opacity', 0)
            .style('filter', 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))');
        
        const nodes = g.selectAll('.node')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', 'node')
            .attr('transform', d => {
                console.log('🔄 Node position (horizontal):', d.y, d.x);
                return `translate(${d.y}, ${d.x})`;
            })  // Swap for horizontal
            .style('opacity', 0);
        
        nodes.append('rect')
            .attr('width', NODE_WIDTH)
            .attr('height', NODE_HEIGHT)
            .attr('x', -NODE_WIDTH / 2)
            .attr('y', -NODE_HEIGHT / 2)
            .attr('rx', 15)
            .attr('ry', 15)
            .style('fill', d => `url(#gradient-${d.data.type})`)
            .style('stroke', d => this.getNodeColor(d.data.type))
            .style('stroke-width', 3)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
        
        const FONT_SIZE = isSmallMobile ? '16px' : isMobile ? '18px' : '20px';
        
        nodes.append('text')
            .attr('dy', 5)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-family', 'monospace')
            .style('font-size', FONT_SIZE)
            .style('font-weight', 'bold')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)')
            .text(d => this.getCompactNodeText(d.data));
        
        this.animateD3Tree(links, nodes);
    }

    getCompactNodeText(node) {
        if (node.value !== null && node.value !== undefined) {
            if (typeof node.value === 'object' && node.value !== null) {
                if (node.value.name && node.value.type) {
                    return `${node.value.type} ${node.value.name}`;
                }
            } else {
                if (node.type === 'ASSIGNMENT') {
                    return `${node.value} =`;
                } else if (node.type === 'BINARY_OP') {
                    return node.value;
                } else {
                    return `${node.type}: ${node.value}`;
                }
            }
        }
        return node.type;
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
    
    getFixedNodeWidth(node, isMobile = false, isSmallMobile = false) {
        const text = this.getNodeText(node, isMobile, isSmallMobile);
        // Fixed dimensions - never shrink based on tree complexity
        const FIXED_CHAR_WIDTH = isSmallMobile ? 20 : isMobile ? 25 : 30;
        const FIXED_PADDING = isSmallMobile ? 60 : isMobile ? 80 : 100;
        const FIXED_MIN_WIDTH = isSmallMobile ? 200 : isMobile ? 250 : 300;
        const FIXED_MAX_WIDTH = isSmallMobile ? 400 : isMobile ? 500 : 600;
        
        return Math.max(FIXED_MIN_WIDTH, Math.min(FIXED_MAX_WIDTH, text.length * FIXED_CHAR_WIDTH + FIXED_PADDING));
    }
    
    getNodeWidth(node, isMobile = false, isSmallMobile = false) {
        // Fallback to fixed width
        return this.getFixedNodeWidth(node, isMobile, isSmallMobile);
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
        links.transition()
            .duration(1000)
            .delay((d, i) => i * 100)
            .style('stroke-opacity', 0.8)
            .ease(d3.easeBackOut);
        
        nodes.transition()
            .duration(800)
            .delay((d, i) => i * 150)
            .style('opacity', 1)
            .attr('transform', function(d) {
                return `translate(${d.x}, ${d.y}) scale(1)`;
            })
            .ease(d3.easeBackOut);
        
        nodes.on('mouseenter', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${d.y}, ${d.x}) scale(1.1)`);
        })
        .on('mouseleave', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${d.y}, ${d.x}) scale(1)`);
        });
    }
}