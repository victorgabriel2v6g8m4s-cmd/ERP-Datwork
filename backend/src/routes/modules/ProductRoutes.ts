import { Router } from 'express';
import { upload } from '../../config/multer.js';
import { productController } from '../../controllers/product/ProductControllerHandler.js';
import { handleMediaUpload } from '../../utils/uploadHandler.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const productRouter = Router();

// Aplica o middleware de segurança em todas as rotas de produtos
productRouter.use(isAuthenticated);

// Cadastro e Catálogo Geral
productRouter.post('/', productController.create.handle);
productRouter.get('/', productController.list.handle);
productRouter.put('/:id', productController.update.handle);
productRouter.patch('/:id/status', productController.updateStatus.handle);
productRouter.patch('/reorder', productController.reorder.handle);

// Perfis Customizados de Ordenação (Mapeados no mesmo controller)
productRouter.post('/orders', productController.customOrder.create);
productRouter.get('/orders', productController.customOrder.index);
productRouter.put('/orders/:id', productController.customOrder.update);
productRouter.delete('/orders/:id', productController.customOrder.destroy);

// Auditoria e Histórico de Custos / Preços
productRouter.get('/:productId/versions', productController.listVersions.handle);

// Rota de Upload centralizada reaproveitando o Helper Universal
productRouter.post('/upload', upload.single('file'), handleMediaUpload);

export { productRouter };
