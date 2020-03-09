import React, { useState } from 'react'
import NodeDisplay from './Node'

/**
 * grid is an array of nodes
 * start will be the start node
 * end will be the end node
 * each node will be {x, y, isVisited, hCost, gCost}
 */
const astar = (start, end) => {
    let openSet = []

    start.g = 0;
    start.f = heuristic(start, end);
    openSet.push(start)

    while (openSet.length > 0) {
        let lowestFIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestFIndex].f) {
                lowestFIndex = i;
            }
        }

        let current = openSet[lowestFIndex];

        if (current.x === end.x && current.y === end.y) {
            return reconstruct_path(current)
        }

        openSet = openSet.filter(node => node.x !== current.x || node.y !== current.y)
        for (let i = 0; i < current.neighbors.length; i++) {
            let neighbor = current.neighbors[i]

            if (!neighbor.isWalkable) {
                continue;
            }

            let tentative_g = current.g + 1;
            if (tentative_g < neighbor.g) {
                neighbor.previous = current;
                neighbor.g = tentative_g;
                neighbor.f = neighbor.g + heuristic(neighbor, end)

                if (!openSet.find(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor)
                }
            }
        }
    }

    return []
}

function reconstruct_path(current) {
    let path = [current]

    while (current.previous) {
        path.push(current.previous)
        current = current.previous
    }
    
    return path
}

function heuristic(a, b) {
    return Math.sqrt(Math.pow((b.x - a.x),2) + Math.pow((b.y-a.y),2))
}

class Node {
    constructor({isWalkable, x, y, isStart, isEnd}) {
        this.x = x;
        this.y = y;
        this.isWalkable = isWalkable
        this.isStart = isStart;
        this.isEnd = isEnd;
        this.f = Infinity;
        this.g = Infinity;
        this.h = null;
        this.neighbors = []
        this.previous = null;
    }

    addNeighbors = function(grid) {
        if (this.x > 0) {
            this.neighbors.push(grid[this.y][this.x - 1])
        }

        if (this.x < grid[0].length - 1) {
            this.neighbors.push(grid[this.y][this.x + 1])
        }

        if (this.y > 0) {
            this.neighbors.push(grid[this.y - 1][this.x])
        }

        if (this.y < grid.length - 1) {
            this.neighbors.push(grid[this.y + 1][this.x])
        }
    }
}

const generateGrid = (rows, cols, start, end) => {
    const currentGrid = []
    for (let i = 0; i < rows; i++) {
        const currentRow = []
        for (let j = 0; j < cols; j++) {
            let node = new Node({
                isWalkable: true,
                x: j,
                y: i,
                isStart: start.x === j && start.y === i,
                isEnd: end.x === j && end.y === i,
            });

            if (node.isStart || node.isEnd) {
                node.isWalkable = true;
            }
            currentRow.push(node)
        }
        currentGrid.push(currentRow)
    }

    for (let i = 0; i < rows ; i++) {
        for (let j = 0; j < cols; j++) {
            currentGrid[i][j].addNeighbors(currentGrid);
        }
    }

    return currentGrid
}

const generateRandomMaze = (grid) => {
    const gridCopy = [...grid.map(g => [...g])]

    for (let i = 0; i < gridCopy.length; i++) {
        for (let j = 0; j < gridCopy.length; j++) {
            gridCopy[i][j].isWalkable = Math.random() < 0.2 ? false : true;
        }
    }

    return gridCopy;
}

export default function PathFinder() {
    const [rows, setRows] = useState(50)
    const [cols, setCols] = useState(50)

    const [start, setStart] = useState({x: 0, y: 0})
    const [end, setEnd] = useState({x: rows - 1, y: cols - 1})
    const [path, setPath] = useState([])

    const [grid, setGrid] = useState(generateGrid(rows, cols, start, end));
    

    const setWall = (x, y, button) => {
        const gridCopy = [...grid.map(g => [...g])]
        if (button === 1) {
            gridCopy[y][x].isWalkable = false;
        } else {
            gridCopy[y][x].isWalkable = true;
        }
        setGrid(gridCopy);
    }

    const displayGrid = (grid) => {
        const nodes = []
        for (let i=0; i< grid.length; i ++) {
            const row = []
            for (let j=0; j< grid[i].length; j++) {
                const currentNode = grid[j][i];
                if (path && path.find(node => node.x === currentNode.x && node.y === currentNode.y)) {
                    row.push(<NodeDisplay key={`row-${i} col-${j}`} {...currentNode} isPath handleClick={setWall}/>)
                } else {
                    row.push(<NodeDisplay key={`row-${i} col-${j}`} {...currentNode} handleClick={setWall}/>)
                }
            }

            nodes.push(row)
        }

        return nodes 
    }

    const searchPath = () => {
        const gridCopy = [...grid.map(g => [...g])]

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                let currentNode = gridCopy[i][j]
                currentNode.f = Infinity;
                currentNode.g = Infinity;
                currentNode.h = null;
            }
        }
        setGrid(gridCopy)

        const startNode = grid[start.x][start.y]
        const endNode = grid[end.x][end.y]

        const foundPath = astar(startNode, endNode)

        if (foundPath.length > 0) {
            setPath(foundPath);
        } else {
            setPath(null)
        }
    }

    const reset = () => {
        setPath([])
        setGrid(generateGrid(rows, cols, start, end))
    }

    const generateMaze = () => {
        setPath([])
        setGrid(generateRandomMaze(grid, 0))
    }

    return (
        <div>
            <div className="grid">
                {!path ? 'No path' : null}
                {displayGrid(grid).map((row, index) => <div className="row" key={index}>{row}</div>)}
                <button onClick={searchPath}>Search</button>
                <button onClick={reset}>Reset</button>
                <button onClick={generateMaze}>Generate Maze</button>
            </div>
        </div>
    )
}
