import ImageKit from 'imagekit';

let imageKitInstance: ImageKit | null = null;

function getImageKit(): ImageKit {
  if (!imageKitInstance) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error('ImageKit credentials are not configured');
    }

    imageKitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  return imageKitInstance;
}

export const imageKit = {
  upload: async (file: Buffer, fileName: string) => {
    return getImageKit().upload({ file, fileName });
  },
  delete: async (fileId: string) => {
    return getImageKit().deleteFile(fileId);
  },
} as any;

export const uploadImageToImageKit = async (
  file: Buffer,
  fileName: string,
  folder: string = 'manuscripts'
): Promise<{ url: string; fileId: string }> => {
  try {
    const result = await getImageKit().upload({
      file: file,
      fileName: fileName,
      folder: `/${folder}`,
      useUniqueFileName: true,
    });

    return {
      url: result.url,
      fileId: result.fileId,
    };
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    throw error;
  }
};

export const deleteImageFromImageKit = async (fileId: string): Promise<void> => {
  try {
    await imageKit.deleteFile(fileId);
  } catch (error) {
    console.error('Error deleting from ImageKit:', error);
    throw error;
  }
};
