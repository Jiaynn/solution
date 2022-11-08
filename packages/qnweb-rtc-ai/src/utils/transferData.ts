/**
 * blob二进制 to base64
 * @param blob
 */
export function blobToDataURI(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result + '');
    };
    reader.onerror = function() {
      reject('Failed to read file!\n\n' + reader.error);
    };
    reader.readAsDataURL(blob);
  });
}
