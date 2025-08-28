
export type Point3D = { x: number; y: number; z: number };
export type Point2D = { x: number; y: number };
export type Face = { a: number; b: number; c: number; depth: number; shade: number };

// 単純な透視投影関数
export function project(point: Point3D, w: number, h: number): Point2D {
	const scale = 100 / (point.z + 3); // zが大きいほど小さく
	return {
		x: point.x * scale + w / 2,
		y: point.y * scale + h / 2,
	}
}

export function projectWithDepth(point: Point3D, w: number, h: number): Point3D {
	const scale = 100 / (point.z + 3); // zが大きいほど小さく
	return {
		x: point.x * scale + w / 2,
		y: point.y * scale + h / 2,
		z: point.z
	}
}

const sleep = (milliseconds: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function drawEdges(ctx: CanvasRenderingContext2D, edges: Array<[number, number]>, points: Point2D[], stepByStep: boolean = false) {
	for (const [a, b] of edges) {
		const {x: x1, y: y1} = points[a]
		const {x: x2, y: y2} = points[b]
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		// 0.5秒待機
		if (stepByStep) {
			await sleep(500);
		}
	}
}

export async function draw(ctx: CanvasRenderingContext2D, faces: Face[], points: Point2D[], drawWire: boolean, stepByStep: boolean = false) {
	for (const f of faces) {
		const A = points[f.a], B = points[f.b], C = points[f.c];

		// グレーの濃淡（簡易ライティング）
		const c = Math.floor(60 + f.shade * 170);
		ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;

		ctx.beginPath();
		ctx.moveTo(A.x, A.y);
		ctx.lineTo(B.x, B.y);
		ctx.lineTo(C.x, C.y);
		ctx.closePath();
		ctx.fill();

		if (drawWire) {
			ctx.strokeStyle = "rgba(0,0,0,0.6)";
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		if (stepByStep) {
			await sleep(500)
		}
	}
}

export function cullBackfaces(triangles: Array<[number, number, number]>, projectedPoints: Point3D[]) {
	return triangles.filter(([ia, ib, ic]) => {
		const A2 = projectedPoints[ia], B2 = projectedPoints[ib], C2 = projectedPoints[ic];
		// 2D外積で向き（時計回り/反時計回り）を判定
		const cross2 =
			(B2.x - A2.x) * (C2.y - A2.y) - (B2.y - A2.y) * (C2.x - A2.x);
		return cross2 > 0
	})
}

export function getRenderFaces(triangles: Array<[number, number, number]>, pointsBeforeProject: Point3D[]) {
	// 簡易ライティング用にワールド空間の法線を計算（視覚的に凹凸が見えやすくなる）
	const lightDirection = normalize({ x: 0.5, y: 0.8, z: 1.0 });

	const faces: Face[] = triangles.map(([ia, ib, ic]) => {
		// 深度（遠い→近い順で描く）
		const depth = (pointsBeforeProject[ia].z + pointsBeforeProject[ib].z + pointsBeforeProject[ic].z) / 3;

		// 3D法線で簡易シェーディング（0〜1）
		const n = faceNormal(pointsBeforeProject[ia], pointsBeforeProject[ib], pointsBeforeProject[ic]);
		const shade = Math.max(0, dot(normalize(n), lightDirection));

		return { a: ia, b: ib, c: ic, depth, shade };
	})

	faces.sort((f1, f2) => f2.depth - f1.depth);

	return faces
}

// X軸回転
function rotateAroundX(p: Point3D, radians: number): Point3D {
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return {
		x: p.x,
		y: p.y * cos - p.z * sin,
		z: p.y * sin + p.z * cos,
	};
}
// Y軸回転
function rotateAroundY(p: Point3D, radians: number): Point3D {
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return {
		x:  p.x * cos + p.z * sin,
		y:  p.y,
		z: -p.x * sin + p.z * cos,
	};
}
// （必要なら）Z軸回転
function rotateAroundZ(p: Point3D, radians: number): Point3D {
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return {
		x: p.x * cos - p.y * sin,
		y: p.x * sin + p.y * cos,
		z: p.z,
	};
}
// 任意の回転を合成（順序は X → Y → Z）
export function rotatePoint(p: Point3D, rx: number, ry: number, rz: number = 0): Point3D {
	const r1 = rotateAroundX(p, rx);
	const r2 = rotateAroundY(r1, ry);
	return rz ? rotateAroundZ(r2, rz) : r2;
}

/* --------- ベクトルユーティリティ（簡易） --------- */
export function sub(a: Point3D, b: Point3D): Point3D { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
export function cross(a: Point3D, b: Point3D): Point3D {
	return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
export function dot(a: Point3D, b: Point3D): number { return a.x * b.x + a.y * b.y + a.z * b.z; }
export function normalize(v: Point3D): Point3D {
	const n = Math.hypot(v.x, v.y, v.z) || 1;
	return { x: v.x / n, y: v.y / n, z: v.z / n };
}
export function faceNormal(a: Point3D, b: Point3D, c: Point3D): Point3D {
	return cross(sub(b, a), sub(c, a));
}