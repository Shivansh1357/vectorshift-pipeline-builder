/**
 * BaseEdge.js - Custom Animated Edge
 * 
 * PURPOSE: A custom edge component that adds visual flair to connections
 * by rendering a moving particle along the path, simulating data flow.
 * 
 * Features:
 * - Uses React Flow's getSmoothStepPath for consistent routing
 * - animated: true by default
 * - Renders a gradient path
 * - Renders a moving particle (circle) that travels from source to target
 */

import React from 'react';
import { BaseEdge, getSmoothStepPath } from 'reactflow';

export const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}) => {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <defs>
                <path id={`edge-path-${id}`} d={edgePath} />
            </defs>

            {/* 1. The main path line */}
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

            {/* 2. The animated particle */}
            <circle r="3" fill="#6366F1">
                <animateMotion dur="2s" repeatCount="indefinite">
                    <mpath href={`#edge-path-${id}`} xlinkHref={`#edge-path-${id}`} />
                </animateMotion>
            </circle>

            {/* A second particle for a "stream" effect (offset by 1s) */}
            <circle r="2" fill="#818CF8" opacity="0.7">
                <animateMotion dur="2s" begin="1s" repeatCount="indefinite">
                    <mpath href={`#edge-path-${id}`} xlinkHref={`#edge-path-${id}`} />
                </animateMotion>
            </circle>
        </>
    );
};
