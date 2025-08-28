import CanvasStep1Basic from './CanvasStep1Basic.tsx'
import type { Point3D } from './helpers.ts'
import CanvasStep2Rotated from './CanvasStep2Rotated.tsx'
import CanvasStep3Rotating from './CanvasStep3Rotating.tsx'
import CanvasStep4Filled from './CanvasStep4Filled.tsx'

const cubeVertices: Point3D[] = [
  { x: -1, y: -1, z: -1 },
  { x:  1, y: -1, z: -1 },
  { x:  1, y:  1, z: -1 },
  { x: -1, y:  1, z: -1 },
  { x: -1, y: -1, z:  1 },
  { x:  1, y: -1, z:  1 },
  { x:  1, y:  1, z:  1 },
  { x: -1, y:  1, z:  1 },
];

const cubeEdges: Array<[number, number]> = [
  [0,1],[1,2],[2,3],[3,0], // 前面
  [4,5],[5,6],[6,7],[7,4], // 背面
  [0,4],[1,5],[2,6],[3,7], // 前後をつなぐ辺
];

const cubeTriangles: Array<[number, number, number]> = [
  // front (-z)
  [0,1,2], [0,2,3],
  // back (+z)
  [5,4,7], [5,7,6],
  // left (-x)
  [4,0,3], [4,3,7],
  // right (+x)
  [1,5,6], [1,6,2],
  // top (+y)
  [3,2,6], [3,6,7],
  // bottom (-y)
  [4,5,1], [4,1,0],
];


export default function App() {
  return (
    <>
    <CanvasStep1Basic vertices={cubeVertices} edges={cubeEdges}/>
    <CanvasStep2Rotated vertices={cubeVertices} edges={cubeEdges}/>
    <CanvasStep3Rotating vertices={cubeVertices} edges={cubeEdges}/>
    <CanvasStep4Filled vertices={cubeVertices} triangles={cubeTriangles} drawWire={true}/>
    </>
  );
}
