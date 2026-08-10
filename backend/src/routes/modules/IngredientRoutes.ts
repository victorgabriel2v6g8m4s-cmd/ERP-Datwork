import { Router } from 'express';
import { upload } from '../../config/multer.js';
import { ingredientController } from '../../controllers/ingredient/IngredientControllerHandler.js';
import { isAuthenticated } from '../../middlewares/auth.js';
import { handleMediaUpload } from '../../utils/uploadHandler.js';

const ingredientRouter = Router();

ingredientRouter.use(isAuthenticated);

ingredientRouter.post('/ingredients', ingredientController.create.handle);
ingredientRouter.get('/ingredients', ingredientController.list.handle);
ingredientRouter.patch('/ingredients/reorder', ingredientController.reorder.handle);
ingredientRouter.post('/ingredients/upload', upload.single('file'), handleMediaUpload);

ingredientRouter.post('/ingredients/orders', ingredientController.orderProfiles.create);
ingredientRouter.get('/ingredients/orders', ingredientController.orderProfiles.list);
ingredientRouter.put('/ingredients/orders/:id', ingredientController.orderProfiles.rename);
ingredientRouter.delete('/ingredients/orders/:id', ingredientController.orderProfiles.remove);

ingredientRouter.get('/ingredients/:ingredientId/versions', ingredientController.listVersions.handle);
ingredientRouter.put('/ingredients/:id', ingredientController.update.handle);
ingredientRouter.patch('/ingredients/:id/status', ingredientController.updateStatus.handle);

export { ingredientRouter };
