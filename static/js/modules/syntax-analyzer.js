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
                <div class="rounded-lg border border-white/10 p-2 bg-gradient-to-br from-slate-900/50 to-slate-800/30 flex-1" style="min-height: 90vh;">
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
        
        // Much larger base dimensions for desktop
        const baseWidth = isSmallMobile ? 1800 : isMobile ? 2400 : 5000;
        const baseHeight = isSmallMobile ? 1200 : isMobile ? 1600 : 3000;
        
        const width = Math.max(containerRect.width || baseWidth, baseWidth);
        const height = Math.max(containerRect.height || baseHeight, baseHeight);
        
        const nodeCount = this.countNodes(astData);
        const treeDepth = this.getTreeDepth(astData);
        
        // Increased spacing for better visibility on desktop
        const nodeSpacing = isSmallMobile ? 500 : isMobile ? 600 : 1000;
        const levelSpacing = isSmallMobile ? 300 : isMobile ? 350 : 500;
        
        // Dynamic sizing based on expression complexity
        const complexityFactor = nodeCount > 10 ? 1.5 : 1;
        const dynamicWidth = Math.max(width, nodeCount * nodeSpacing * complexityFactor);
        const dynamicHeight = Math.max(height, treeDepth * levelSpacing * complexityFactor);
        
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
        
        const margin = isSmallMobile ? 80 : isMobile ? 100 : 200;
        const treeLayout = d3.tree()
            .size([dynamicWidth - margin * 2, dynamicHeight - margin])
            .separation((a, b) => {
                const aWidth = this.getNodeWidth(a.data, isMobile, isSmallMobile);
                const bWidth = this.getNodeWidth(b.data, isMobile, isSmallMobile);
                // Increased separation for desktop
                const minSeparation = (aWidth + bWidth) / 2 + (isSmallMobile ? 60 : isMobile ? 80 : 150);
                const scaleFactor = isSmallMobile ? 120 : isMobile ? 150 : 250;
                return a.parent === b.parent ? 
                    Math.max(2, minSeparation / scaleFactor) : 
                    Math.max(3, minSeparation / (scaleFactor * 0.7));
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
        
        // Larger nodes for desktop
        const nodeHeight = isSmallMobile ? 120 : isMobile ? 140 : 200;
        const borderRadius = isSmallMobile ? 25 : isMobile ? 30 : 35;
        
        nodes.append('rect')
            .attr('width', d => this.getNodeWidth(d.data, isMobile, isSmallMobile))
            .attr('height', nodeHeight)
            .attr('x', d => -this.getNodeWidth(d.data, isMobile, isSmallMobile) / 2)
            .attr('y', -nodeHeight / 2)
            .attr('rx', borderRadius)
            .attr('ry', borderRadius)
            .style('fill', d => `url(#gradient-${d.data.type})`)
            .style('stroke', d => this.getNodeColor(d.data.type))
            .style('stroke-width', 3)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
        
        // Larger font for desktop
        const fontSize = isSmallMobile ? '32px' : isMobile ? '36px' : '48px';
        
        nodes.append('text')
            .attr('dy', 3)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-family', 'monospace')
            .style('font-size', fontSize)
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
    
    getNodeWidth(node, isMobile = false, isSmallMobile = false) {
        const text = this.getNodeText(node, isMobile, isSmallMobile);
        // Increased dimensions for desktop
        const charWidth = isSmallMobile ? 30 : isMobile ? 35 : 50;
        const padding = isSmallMobile ? 80 : isMobile ? 100 : 150;
        const minWidth = isSmallMobile ? 300 : isMobile ? 350 : 500;
        const maxWidth = isSmallMobile ? 600 : isMobile ? 700 : 1000;
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