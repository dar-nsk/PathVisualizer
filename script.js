const rows = 20;
const cols = 20;
let grid = [];
let startNode = null;
let endNode = null;

// Initialize grid and render
function createGrid() {
    const gridContainer = document.getElementById("grid-container");
    gridContainer.innerHTML = "";
    grid = [];

    for (let row = 0; row < rows; row++) {
        const currentRow = [];
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.addEventListener("click", () => handleCellClick(row, col, cell));
            gridContainer.appendChild(cell);
            currentRow.push({ row, col, isWall: false, isVisited: false, distance: Infinity, previousNode: null });
        }
        grid.push(currentRow);
    }
}

// Handle cell clicks for start, end, and walls
function handleCellClick(row, col, cell) {
    const node = grid[row][col];

    if (!startNode) {
        startNode = node;
        cell.classList.add("start");
    } else if (!endNode) {
        endNode = node;
        cell.classList.add("end");
    } else {
        node.isWall = !node.isWall;
        cell.classList.toggle("wall");
    }
}

// Reset grid
function resetGrid() {
    startNode = null;
    endNode = null;
    createGrid();
    updateStats(0, 0, 0);
    document.getElementById("explanation").innerText = "Select an algorithm to see its explanation here.";
}

// Update metrics
function updateStats(nodesVisited, pathLength, executionTime) {
    document.getElementById("nodes-visited").innerText = nodesVisited;
    document.getElementById("path-length").innerText = pathLength;
    document.getElementById("execution-time").innerText = executionTime;
}

// BFS Algorithm
function bfs(grid, startNode, endNode) {
    const queue = [startNode];
    const visitedNodes = [];
    startNode.isVisited = true;

    while (queue.length) {
        const currentNode = queue.shift();
        visitedNodes.push(currentNode);

        if (currentNode === endNode) break;

        for (const neighbor of getNeighbors(currentNode)) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.isVisited = true;
                neighbor.previousNode = currentNode;
                queue.push(neighbor);
            }
        }
    }

    return visitedNodes;
}

// Dijkstra's Algorithm
function dijkstra(grid, startNode, endNode) {
    const unvisitedNodes = [];
    const visitedNodes = [];
    startNode.distance = 0;

    for (const row of grid) {
        for (const node of row) {
            unvisitedNodes.push(node);
        }
    }

    while (unvisitedNodes.length) {
        unvisitedNodes.sort((a, b) => a.distance - b.distance);
        const closestNode = unvisitedNodes.shift();

        if (closestNode.isWall) continue;
        if (closestNode.distance === Infinity) break;

        closestNode.isVisited = true;
        visitedNodes.push(closestNode);

        if (closestNode === endNode) break;

        for (const neighbor of getNeighbors(closestNode)) {
            const distance = closestNode.distance + 1; // All edges have weight 1
            if (distance < neighbor.distance) {
                neighbor.distance = distance;
                neighbor.previousNode = closestNode;
            }
        }
    }

    return visitedNodes;
}

// A* Algorithm
function astar(grid, startNode, endNode) {
    const openSet = [startNode];
    const visitedNodes = [];
    startNode.distance = 0;

    while (openSet.length) {
        openSet.sort((a, b) => (a.distance + heuristic(a, endNode)) - (b.distance + heuristic(b, endNode)));
        const currentNode = openSet.shift();

        if (currentNode.isWall) continue;
        if (currentNode === endNode) break;

        currentNode.isVisited = true;
        visitedNodes.push(currentNode);

        for (const neighbor of getNeighbors(currentNode)) {
            const tempDistance = currentNode.distance + 1; // All edges have weight 1
            if (tempDistance < neighbor.distance) {
                neighbor.distance = tempDistance;
                neighbor.previousNode = currentNode;
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return visitedNodes;
}

// Heuristic function for A*
function heuristic(node, endNode) {
    return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
}

// Get neighbors
function getNeighbors(node) {
    const { row, col } = node;
    const neighbors = [];

    if (row > 0) neighbors.push(grid[row - 1][col]); // Up
    if (row < rows - 1) neighbors.push(grid[row + 1][col]); // Down
    if (col > 0) neighbors.push(grid[row][col - 1]); // Left
    if (col < cols - 1) neighbors.push(grid[row][col + 1]); // Right

    return neighbors;
}

// Visualize algorithm
function visualize() {
    if (!startNode || !endNode) {
        alert("Please set both a start and an end node.");
        return;
    }

    const algorithm = document.getElementById("algorithm").value;
    const startTime = performance.now();
    let visitedNodes = [];

    switch (algorithm) {
        case "bfs":
            visitedNodes = bfs(grid, startNode, endNode);
            document.getElementById("explanation").innerText = "BFS explores all nodes at the current depth before moving to the next.";
            break;
        case "dijkstra":
            visitedNodes = dijkstra(grid, startNode, endNode);
            document.getElementById("explanation").innerText = "Dijkstra's Algorithm finds the shortest path by exploring the least costly node first.";
            break;
        case "astar":
            visitedNodes = astar(grid, startNode, endNode);
            document.getElementById("explanation").innerText = "A* Algorithm uses heuristics to find the shortest path more efficiently.";
            break;
        default:
            alert("Unknown algorithm selected.");
            return;
    }

    const endTime = performance.now();
    animatePathfinding(visitedNodes, endNode, endTime - startTime);
}

// Animate pathfinding
function animatePathfinding(visitedNodes, endNode, executionTime) {
    let nodesVisited = 0;

    for (let i = 0; i < visitedNodes.length; i++) {
        setTimeout(() => {
            const { row, col } = visitedNodes[i];
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add("visited");
            nodesVisited++;

            if (i === visitedNodes.length - 1) {
                animatePath(endNode, executionTime, nodesVisited);
            }
        }, 20 * i);
    }
}

// Animate path
function animatePath(endNode, executionTime, nodesVisited) {
    const path = [];
    let currentNode = endNode;

    while (currentNode) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }

    for (let i = 0; i < path.length; i++) {
        setTimeout(() => {
            const { row, col } = path[i];
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add("path");
        }, 50 * i);
    }

    updateStats(nodesVisited, path.length - 1, executionTime.toFixed(2));
}

// Initialize
createGrid();
document.getElementById("reset-btn").addEventListener("click", resetGrid);
document.getElementById("visualize-btn").addEventListener("click", visualize);
