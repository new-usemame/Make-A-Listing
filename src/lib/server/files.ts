import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';

const DATA_DIR = join(process.cwd(), 'data', 'uploads');

export function getUploadDir(userId: string, sessionId: string): string {
	const dir = join(DATA_DIR, userId, sessionId);
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	return dir;
}

export async function saveImage(
	file: File,
	userId: string,
	sessionId: string
): Promise<string> {
	const dir = getUploadDir(userId, sessionId);
	const buffer = Buffer.from(await file.arrayBuffer());
	const filename = `${uuid()}.jpg`;
	const filepath = join(dir, filename);

	await sharp(buffer).jpeg({ quality: 90 }).toFile(filepath);

	// Generate thumbnail
	const thumbPath = join(dir, `thumb_${filename}`);
	await sharp(buffer)
		.resize(200, 200, { fit: 'cover' })
		.jpeg({ quality: 80 })
		.toFile(thumbPath);

	return `${userId}/${sessionId}/${filename}`;
}

export async function imageToBase64(relativePath: string): Promise<string> {
	const fullPath = join(DATA_DIR, relativePath);
	const buffer = readFileSync(fullPath);
	return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

export async function extractPdfText(file: File): Promise<string> {
	const buffer = Buffer.from(await file.arrayBuffer());
	const { PDFParse } = await import('pdf-parse');
	const parser = new PDFParse({ data: buffer });
	await parser.load();
	return await parser.getText();
}
