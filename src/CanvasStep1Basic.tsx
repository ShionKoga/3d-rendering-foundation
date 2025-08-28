import { useEffect, useRef } from 'react'
import { drawEdges, type Point3D, project } from './helpers.ts'

export default function CanvasStep1Basic({vertices, edges}: {vertices: Point3D[], edges: Array<[number, number]>}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const w = canvas.width;
		const h = canvas.height;

		ctx.clearRect(0, 0, w, h);
		ctx.strokeStyle = "black";

		drawEdges(ctx, edges, vertices.map((p) => project(p, w, h)), true);
	}, []);

	return (
		<div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
			<canvas
				ref={canvasRef}
				width={400}
				height={400}
				style={{ border: "1px solid #ccc" }}
			/>
		</div>
	);
}