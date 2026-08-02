import * as Crypto from 'expo-crypto';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { supabase } from './client';

async function uploadImage(bucket: string, userId: string, localUri: string, width: number) {
  const context = ImageManipulator.manipulate(localUri);
  context.resize({ width });
  const rendered = await context.renderAsync();
  const out = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

  const arraybuffer = await fetch(out.uri).then((r) => r.arrayBuffer());
  const path = `${userId}/${Crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, arraybuffer, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function uploadPostImage(userId: string, localUri: string): Promise<string> {
  return uploadImage('post-images', userId, localUri, 1080);
}

export function uploadAvatar(userId: string, localUri: string): Promise<string> {
  return uploadImage('avatars', userId, localUri, 512);
}
