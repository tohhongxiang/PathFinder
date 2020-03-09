import React from 'react'
import styles from './Node.module.css'

export default function Node({isStart, isEnd, isWalkable, isVisited, isPath, handleClick, x, y, ...props}) {
    return (
        <div 
        className={`node ${styles.node} ${isStart ? styles.start : null} ${isEnd ? styles.finish : null} ${!isWalkable ? styles.disabled : null} ${isPath ? styles.isPath : null}`}
        onMouseOver={(e) => {
            if (e.buttons === 1 || e.buttons === 3) {
                console.log(e.buttons)
                handleClick(x, y, e.buttons)
            }
        }}
        onClick={() => handleClick(x, y)}
        >
        
        </div>
    )
}
