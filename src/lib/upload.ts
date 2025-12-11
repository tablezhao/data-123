import { supabase } from '@/db/supabase';

const BUCKET_NAME = 'app-85w8y6vjhh4x_website_images';
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

// 压缩图片
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // 限制最大分辨率为1080p
        const maxDimension = 1080;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法获取canvas上下文'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 尝试不同的质量设置
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'));
                return;
              }

              if (blob.size <= MAX_FILE_SIZE || quality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/webp',
            quality
          );
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error('图片加载失败'));
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
  });
}

// 验证文件名（只允许英文字母和数字）
function sanitizeFileName(fileName: string): string {
  const ext = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.replace(`.${ext}`, '');
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitized}_${Date.now()}.${ext}`;
}

// 上传图片
export async function uploadImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string; compressed: boolean }> {
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('不支持的文件格式，请上传 JPEG、PNG、GIF、WEBP 或 AVIF 格式的图片');
  }

  let uploadFile = file;
  let compressed = false;

  // 如果文件超过1MB，进行压缩
  if (file.size > MAX_FILE_SIZE) {
    try {
      uploadFile = await compressImage(file);
      compressed = true;
      console.log(`图片已压缩：${(file.size / 1024).toFixed(2)}KB -> ${(uploadFile.size / 1024).toFixed(2)}KB`);
    } catch (error) {
      console.error('图片压缩失败:', error);
      throw new Error('图片压缩失败，请尝试上传更小的图片');
    }
  }

  // 验证压缩后的文件大小
  if (uploadFile.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024}KB）`);
  }

  // 清理文件名
  const fileName = sanitizeFileName(uploadFile.name);
  const filePath = `${Date.now()}_${fileName}`;

  // 上传到Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, uploadFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('上传失败:', error);
    throw new Error(`上传失败: ${error.message}`);
  }

  // 获取公开URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  if (onProgress) {
    onProgress(100);
  }

  return {
    url: urlData.publicUrl,
    path: data.path,
    compressed,
  };
}

// 删除图片
export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('删除失败:', error);
    throw new Error(`删除失败: ${error.message}`);
  }
}
