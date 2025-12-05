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
        const container = d3.select('#d3TreeContainer');
        container.selectAll('*').remove();
        
        const isMobile = window.innerWidth < 768;
        const isSmallMobile = window.innerWidth < 480;
        
        const nodeCount = this.countNodes(astData);
        const treeDepth = this.getTreeDepth(astData);
        
        // Fixed spacing - no shrinking based on complexity
        const FIXED_NODE_SPACING = isSmallMobile ? 400 : isMobile ? 500 : 800;
        const FIXED_LEVEL_SPACING = isSmallMobile ? 250 : isMobile ? 300 : 400;
        
        // Calculate required dimensions based on tree structure
        const requiredWidth = Math.max(2000, nodeCount * FIXED_NODE_SPACING);
        const requiredHeight = Math.max(1000, treeDepth * FIXED_LEVEL_SPACING);
        
        // Always use calculated dimensions - never shrink
        const dynamicWidth = requiredWidth;
        const dynamicHeight = requiredHeight;
        
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
        
        const margin = isSmallMobile ? 100 : isMobile ? 150 : 200;
        const treeLayout = d3.tree()
            .size([dynamicWidth - margin * 2, dynamicHeight - margin])
            .separation((a, b) => {
                // Fixed separation - never shrink
                const FIXED_SEPARATION = isSmallMobile ? 1.5 : isMobile ? 2 : 3;
                return a.parent === b.parent ? FIXED_SEPARATION : FIXED_SEPARATION * 1.2;
            });
        
        treeLayout(root);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin / 2})`);
        
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
            .style('stroke-width', isSmallMobile ? 2 : 3)
            .style('stroke-opacity', 0)
            .style('filter', 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))');
        
        const nodes = g.selectAll('.node')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .style('opacity', 0);
        
        // Fixed node sizes - never shrink
        const FIXED_NODE_HEIGHT = isSmallMobile ? 100 : isMobile ? 120 : 150;
        const FIXED_BORDER_RADIUS = isSmallMobile ? 20 : isMobile ? 25 : 30;
        
        nodes.append('rect')
            .attr('width', d => this.getFixedNodeWidth(d.data, isMobile, isSmallMobile))
            .attr('height', FIXED_NODE_HEIGHT)
            .attr('x', d => -this.getFixedNodeWidth(d.data, isMobile, isSmallMobile) / 2)
            .attr('y', -FIXED_NODE_HEIGHT / 2)
            .attr('rx', FIXED_BORDER_RADIUS)
            .attr('ry', FIXED_BORDER_RADIUS)
            .style('fill', d => `url(#gradient-${d.data.type})`)
            .style('stroke', d => this.getNodeColor(d.data.type))
            .style('stroke-width', 3)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
        
        // Fixed font sizes
        const FIXED_FONT_SIZE = isSmallMobile ? '24px' : isMobile ? '28px' : '32px';
        
        nodes.append('text')
            .attr('dy', 3)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-family', 'monospace')
            .style('font-size', FIXED_FONT_SIZE)
            .style('font-weight', 'bold')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)')
            .text(d => this.getNodeText(d.data, isMobile, isSmallMobile));
        
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
                .attr('transform', `translate(${d.x}, ${d.y}) scale(1.1)`);
        })
        .on('mouseleave', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${d.x}, ${d.y}) scale(1)`);
        });
    }
}