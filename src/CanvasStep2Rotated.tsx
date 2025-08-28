import { useEffect, useRef } from "react";
import { type Point3D, rotatePoint, drawEdges, project } from './helpers'

export default function CanvasStep2Rotated({
	vertices,
	edges,
	autoRotate = false
}: {
	vertices: Point3D[];
	edges: Array<[number, number]>;
	autoRotate?: boolean
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	async function renderWithAngle(rotateXAngle: number, rotateYAngle: number, rotateZAngle: number) {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const w = canvas.width;
		const h = canvas.height;
		ctx.strokeStyle = "black";

		// 頂点を回転
		const rotatedVertices = vertices.map((p) => rotatePoint(p, rotateXAngle, rotateYAngle, rotateZAngle));
		const projectedVertices = rotatedVertices.map((p) => project(p, w, h))

		// クリアして一括描画
		ctx.clearRect(0, 0, w, h);
		await drawEdges(ctx, edges, projectedVertices, !autoRotate)
	}

	useEffect(() => {
		let rotateXAngle = Math.PI / 6;
		let rotateYAngle = Math.PI / 5;

		renderWithAngle(rotateXAngle, rotateYAngle, 0)

		if (!autoRotate) return
		const intervalId = setInterval(async () => {
			rotateXAngle += Math.PI / 36;
			rotateYAngle += Math.PI / 48;

			await renderWithAngle(rotateXAngle, rotateYAngle, 0)
		}, 500);

		return () => clearInterval(intervalId);
	}, [vertices, edges]);

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