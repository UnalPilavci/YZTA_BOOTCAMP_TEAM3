import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { VisionError } from './errors';
import type { VisionInput } from './types';

const MAX_WIDTH = 1024;
const COMPRESS = 0.6;

export async function prepareImage(uri: string): Promise<VisionInput> {
  if (!uri) throw new VisionError('parse', 'result.failed', 'empty image uri');
  try {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: MAX_WIDTH });
    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({
      base64: true,
      compress: COMPRESS,
      format: SaveFormat.JPEG,
    });
    if (!result.base64) {
      throw new VisionError('parse', 'result.failed', 'no base64 output');
    }
    return { base64: result.base64, mimeType: 'image/jpeg' };
  } catch (e) {
    if (e instanceof VisionError) throw e;
    throw new VisionError('parse', 'result.failed', `image prepare failed: ${String(e)}`);
  }
}
