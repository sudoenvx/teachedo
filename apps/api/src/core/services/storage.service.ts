import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const uploadRoot = path.resolve(process.cwd(), 'uploads');

export class StorageService {
    public async save(file: Express.Multer.File, folder: string): Promise<string> {
        const extension = path.extname(file.originalname).toLowerCase() || this.extensionFromMime(file.mimetype);
        const relativePath = path.join(folder, `${randomUUID()}${extension}`);
        const absolutePath = path.join(uploadRoot, relativePath);

        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, file.buffer);
        return `/${path.posix.join('uploads', ...relativePath.split(path.sep))}`;
    }

    public async delete(resourceUrl?: string | null): Promise<void> {
        if (!resourceUrl || !resourceUrl.startsWith('/uploads/')) return;
        const relativePath = resourceUrl.replace(/^\/uploads\//, '');
        const absolutePath = path.resolve(uploadRoot, relativePath);
        if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) return;

        try {
            await fs.unlink(absolutePath);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
    }

    private extensionFromMime(mimeType: string): string {
        const extensions: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
        };
        return extensions[mimeType] || '';
    }
}

export const storageService = new StorageService();
