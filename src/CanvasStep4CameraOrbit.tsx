
// CanvasStep4CameraOrbit.tsx
import { useEffect, useRef } from "react";
import {
	type Point3D, type Point2D, type Face,
	rotatePoint,
	cullBackfaces, getRenderFaces, draw,
	projectFromCameraWithDepth, normalize
} from "./helpers";

type Triangle = [number, number, number];

export default function CanvasStep4CameraOrbit({
	vertices,
	triangles,
	drawWire = true,
	autoOrbit = false,
}: {
	vertices: Point3D[];
	triangles: Triangle[];
	drawWire?: boolean;
	autoOrbit?: boolean;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// カメラの球座標パラメータ
	let radius = 5;           // 原点からの距離
	let yaw = 0.0;            // 左右（水平回転）
	let pitch = 0.6;          // 上下（垂直回転）: -π/2 < pitch < π/2
	const target: Point3D = { x: 0, y: 0, z: 0 };

	function cameraPositionFromOrbit(): Point3D {
		// 球→直交座標系（右手系）
		const x = radius * Math.cos(pitch) * Math.sin(yaw);
		const y = radius * Math.sin(pitch);
		const z = radius * Math.cos(pitch) * Math.cos(yaw);
		return { x, y, z };
	}

	async function renderOnce(xAngle: number, yAngle: number, zAngle: number) {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const w = canvas.width;
		const h = canvas.height;

		// 1) モデルを回転（モデル行列）
		const rotated = vertices.map((p) => rotatePoint(p, xAngle, yAngle, zAngle));

		// 2) カメラ位置を計算
		const camera = cameraPositionFromOrbit();

		// 3) 投影（カメラ視点）
		const projected = rotated.map((p) =>
			projectFromCameraWithDepth(p, camera, target, w, h, 120)
		);

		// 背面や背後（zCam<=0）で NaN になった頂点を含む三角形は自然に弾かれるよう
		const culled = cullBackfaces(triangles, projected as any); // projectedのx,yを使う

		// 4) フェース（明るさ・深度）
		// ここは Lambert のまま。Phongにしたいなら getRenderFaces 内の lambertShading を phongShading に差し替え
		const faces: Face[] = getRenderFaces(culled, rotated);

		// 5) 描画
		ctx.clearRect(0, 0, w, h);
		await draw(ctx, faces, projected as unknown as Point2D[], drawWire, false);
	}

	useEffect(() => {
		let rx = Math.PI / 6;
		let ry = Math.PI / 5;
		const rz = 0;

		// 初回描画
		renderOnce(rx, ry, rz);

		// キー操作
		function onKeyDown(e: KeyboardEvent) {
			const stepYaw = 0.1;
			const stepPitch = 0.08;
			const stepRadius = 0.3;

			switch (e.key) {
				case "ArrowLeft":  yaw -= stepYaw; break;
				case "ArrowRight": yaw += stepYaw; break;
				case "ArrowUp":    pitch = Math.min(pitch + stepPitch, 1.3); break;
				case "ArrowDown":  pitch = Math.max(pitch - stepPitch, -1.3); break;
				case "+": case "=": radius = Math.max(1.5, radius - stepRadius); break; // 近づく
				case "-": case "_": radius = Math.min(12, radius + stepRadius); break;  // 遠ざかる
				default: return;
			}
			e.preventDefault();
			renderOnce(rx, ry, rz);
		}

		window.addEventListener("keydown", onKeyDown);

		// 自動オービット（rAFは使わない）
		let intervalId: number | undefined;
		if (autoOrbit) {
			intervalId = window.setInterval(() => {
				yaw += 0.1;
				renderOnce(rx, ry, rz);
			}, 500);
		}

		return () => {
			window.removeEventListener("keydown", onKeyDown);
			if (intervalId !== undefined) clearInterval(intervalId);
		};
	}, [vertices, triangles, drawWire, autoOrbit]);

	return (
		<div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
			<canvas
				ref={canvasRef}
				width={400}
				height={400}
				style={{ border: "1px solid #ccc" }}
			/>
			<div style={{ marginLeft: 12, fontSize: 12, color: "#334155" }}>
				<div><b>操作</b></div>
				<div>←/→ : 視点の左右回転（Yaw）</div>
				<div>↑/↓ : 視点の上下回転（Pitch）</div>
				<div>+ / - : ズーム（半径）</div>
			</div>
		</div>
	);
}
