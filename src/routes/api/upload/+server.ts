import type { RequestHandler } from '@sveltejs/kit';
import { exec as baseExec, spawn } from 'child_process';
import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import utils from 'util';

const exec = utils.promisify(baseExec);

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const files = formData.getAll('files') as File[];

	const promises = files.map(async (file) => {
		const filePath = path.join(`static/uploads`, file.name);
		await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
		await runExifTool(filePath);
		return file.name;
	});

	const statuses = await Promise.allSettled(promises);
	console.log(statuses);

	await exec(`tar -czvf 'files.tar.gz' --exclude '.gitkeep' static/uploads`);
	await cleanupTempFiles();

	const archive = createReadStream('files.tar.gz');

	return new Response(archive, {
		status: 200,
		headers: {
			'Content-Disposition': 'attachment; filename=files.tar.gz',
			'Content-Type': 'application/gzip'
		}
	});
};

function runExifTool(filePath: string): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const exif = spawn('exiftool', ['-all=', '-overwrite_original_in_place', filePath]);
		let finalData: Buffer;

		exif.stdout.on('data', (data) => {
			console.log(`exif stdout: ${data}`);
			finalData = data;
		});

		exif.stderr.on('data', (data) => {
			console.error(`exif stderr: ${data}`);
		});

		exif.on('close', (code) => {
			if (code !== 0) {
				reject(new Error(`exiftool process exited with code ${code}`));
			} else {
				resolve(finalData);
			}
		});
	});
}

async function cleanupTempFiles() {
	for (const filename of await fs.readdir('static/uploads', {
		encoding: 'utf-8'
	})) {
		if (filename !== '.gitkeep') {
			await fs.rm(path.join('static/uploads', filename));
		}
	}
}
