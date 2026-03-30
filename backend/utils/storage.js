const fs = require('fs');
const path = require('path');
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // Future S3 support

class StorageService {
  constructor() {
    this.useS3 = process.env.STORAGE_TYPE === 's3';
    
    if (this.useS3) {
      // Initialize S3 client here if needed
      // this.s3 = new S3Client({ region: process.env.AWS_REGION });
    }
    
    // Ensure uploads directory exists for local storage
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
  }

  /**
   * Upload a file
   * @param {Buffer} fileBuffer - Buffer of the file
   * @param {String} fileName - Name of the file
   * @param {String} mimeType - MIME type of the file
   * @returns {Promise<String>} - URL or path to the uploaded file
   */
  async uploadFile(fileBuffer, fileName, mimeType) {
    if (this.useS3) {
      // Implement S3 upload logic here
      // const command = new PutObjectCommand({
      //   Bucket: process.env.S3_BUCKET_NAME,
      //   Key: fileName,
      //   Body: fileBuffer,
      //   ContentType: mimeType
      // });
      // await this.s3.send(command);
      // return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      throw new Error('S3 upload not implemented yet');
    } else {
      const filePath = path.join('uploads', fileName);
      fs.writeFileSync(filePath, fileBuffer);
      return `/api/uploads/${fileName}`; // Adjust based on how you serve static files
    }
  }

  /**
   * Delete a file
   * @param {String} fileName - Name of the file to delete
   */
  async deleteFile(fileName) {
    if (this.useS3) {
      // Implement S3 delete logic
    } else {
      const filePath = path.join('uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}

module.exports = new StorageService();
