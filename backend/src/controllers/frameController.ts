import QRCode from 'qrcode';
import { composePhotoBooth } from '../services/photoBooth.js';
import { listFrames } from '../services/frameService.js';
import * as photoService from '../services/photoService.js';
import path from 'path';
import fs from 'fs';



export const getFrames = async (req: any, res: any) => {

};

export const getPhoto = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const photo = await photoService.getPhotoById(id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    res.json({
      success: true,
      data: photo,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching photo',
      error: err.message,
    });
  }
};


