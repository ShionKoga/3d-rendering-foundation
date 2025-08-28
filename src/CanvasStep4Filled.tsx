import { useEffect, useRef } from "react";
import {
	cullBackfaces,
	draw,
	type Face,
	getRenderFaces,
	type Point3D,
	projectWithDepth,
	rotatePoint
} from './helpers'

type Triangle = [number, number, number];

export default function CanvasStep4Filled({
	vertices,
	triangles,
	drawWire = true,
}: {
	vertices: Point3D[];
	triangles: Triangle[];
	drawWire?: boolean;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvasElement = canvasRef.current;
		if (!canvasElement) return;
		const drawingContext = canvasElement.getContext("2d");
		if (!drawingContext) return;

		const w = canvasElement.width;
		const h = canvasElement.height;

		const rotateXAngle = Math.PI / 6;
		const rotateYAngle = Math.PI / 5;
		const rotateZAngle = 0;

		// 1) モデル空間の頂点を回転（ワールド空間に相当）
		const rotated = vertices.map((p) => rotatePoint(p, rotateXAngle, rotateYAngle, rotateZAngle));

		// 2) 画面座標へ投影
		const projected = rotated.map((p) => projectWithDepth(p, w, h));

		// 3) バックフェイスカリング（スクリーン空間の三角形の向きで判定）
		const culledTriangles = cullBackfaces(triangles, projected)
		const faces: Face[] = getRenderFaces(culledTriangles, rotated);

		// 4) 描画
		drawingContext.clearRect(0, 0, w, h);
		draw(drawingContext, faces, projected, drawWire, true)
	}, [vertices, triangles, drawWire]);

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
