import { supabase } from '@/db/supabase';

interface UploadOptions {
  bucketName?: string;
  path?: string;
  cacheControl?: number;
  upsert?: boolean;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// 从环境变量获取默认存储桶名称
const DEFAULT_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'site-assets';

/**
 * 上传图片到 Supabase Storage
 * @param file - 要上传的文件
 * @param options - 上传选项
 * @returns 上传结果，包含成功状态、文件URL或错误信息
 */
export async function uploadImage(file: File, options: UploadOptions): Promise<UploadResult> {
  try {
    const {
      bucketName = DEFAULT_STORAGE_BUCKET,
      path = '',
      cacheControl = 3600,
      upsert = true,
    } = options;

    // 验证存储桶名称
    if (!bucketName) {
      return {
        success: false,
        error: '存储桶名称未配置，请联系管理员',
      };
    }

    // 生成唯一的文件名，避免冲突
    const fileName = `${Date.now()}-${file.name}`;
    const fullPath = path ? `${path}/${fileName}` : fileName;

    console.log('上传到存储桶:', bucketName);
    console.log('上传路径:', fullPath);
    console.log('环境变量中的存储桶:', DEFAULT_STORAGE_BUCKET);

    // 上传文件到 Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, file, {
        cacheControl: cacheControl.toString(),
        upsert,
      });

    if (error) {
      console.error('Supabase 上传错误详情:', error);
      
      // 处理特定的错误类型
      if (error.code === '404' || error.message.includes('Bucket not found')) {
        return {
          success: false,
          error: `存储桶不存在: ${bucketName}。请确保 Supabase 项目中已创建该存储桶并配置正确的权限`,
        };
      } else if (error.code === '403') {
        return {
          success: false,
          error: `无权限访问存储桶: ${bucketName}。请检查存储桶的访问权限配置`,
        };
      }
      
      throw error;
    }

    // 获取文件的公共URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullPath);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error('上传失败:', error);
    return {
      success: false,
      error: error.message || '上传失败，请检查网络连接或联系管理员',
    };
  }
}

/**
 * 删除 Supabase Storage 中的图片
 * @param url - 要删除的图片URL
 * @param bucketName - 存储桶名称
 * @returns 删除结果
 */
export async function deleteImage(url: string, bucketName: string): Promise<boolean> {
  try {
    // 从URL中提取文件路径
    const urlObject = new URL(url);
    const path = urlObject.pathname.replace(`/storage/v1/object/public/${bucketName}/`, '');

    // 删除文件
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('删除图片失败:', error);
    return false;
  }
}

/**
 * 获取图片的公共URL
 * @param bucketName - 存储桶名称
 * @param path - 文件路径
 * @returns 公共URL
 */
export function getPublicUrl(bucketName: string, path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);
  
  return publicUrl;
}
