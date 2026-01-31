import * as frameService from '../services/frameService.js';



export const getFrameByIdController = async (req: any, res: any) => {
  try {
     const { id } = req.params;
     const frame = await frameService.getFrameById(id);
 
     res.json({
       success: true,
       data: frame,
     }); 
   } catch (err: any) {
     res.status(500).json({
       success: false,
       message: 'Error fetching frame',
       error: err.message,
     });
   }
};


export const generateFrame = async (req: any, res: any) => {
  try {
     const frame = await frameService.createFrame(req.body);
 
     res.json({
       success: true,
       data: frame,
     }); 
   } catch (err: any) {
     res.status(500).json({
       success: false,
       message: 'Error fetching frame',
       error: err.message,
     });
   }
};

export const editFrame = async (req: any, res: any) => {
  try {
     const { id } = req.params;
     const frame = await frameService.updateFrame(id, req.body);
 
     res.json({
       success: true,
       data: frame,
     }); 
   } catch (err: any) {
     res.status(500).json({
       success: false,
       message: 'Error updating frame',
       error: err.message,
     });
   }
};

export const deleteFrame = async (req: any, res: any) => {
  try {
     const { id } = req.params;
     const frame = await frameService.deleteFrame(id);
 
     res.json({
       success: true,
      message: 'Frame deleted successfully',
     }); 
   } catch (err: any) {
     res.status(500).json({
       success: false,
       message: 'Error deleting frame',
       error: err.message,
     });
   }
}

