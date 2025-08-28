import { useEffect, useRef } from "react";
import { type Point3D, rotatePoint, drawEdges, project } from './helpers'

export default function CanvasStep3Rotating({
	vertices,
	edges,
}: {
	vertices: Point3D[];
	edges: Array<[number, number]>;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const w = canvas.width;
		const h = canvas.height;

		ctx.strokeStyle = "black";

		let rotateXAngle = 0;
		let rotateYAngle = 0;

		// 0.5秒ごとに角度を進めて再描画（rAFは不使用）
		const intervalId = setInterval(() => {
			// 角度を少しずつ進める
			rotateXAngle += Math.PI / 36; // 5°
			rotateYAngle += Math.PI / 48; // 3.75°

			// 頂点を回転
			const rotatedVertices = vertices.map((p) => rotatePoint(p, rotateXAngle, rotateYAngle, 0));
			const projectedVertices = rotatedVertices.map((p) => project(p, w, h))

			// クリアして一括描画
			ctx.clearRect(0, 0, w, h);
			drawEdges(ctx, edges, projectedVertices)
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