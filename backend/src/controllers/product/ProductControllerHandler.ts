import { CreateProductController } from './modules/CreateProductController.js';
import { ListProductsController } from './modules/ListProductsController.js';
import { UpdateProductController } from './modules/UpdateProductController.js';
import { UpdateProductStatusController } from './modules/UpdateProductStatusController.js';
import { ReorderProductsController } from './modules/ReorderProductsController.js';
import { CustomOrderController } from './modules/CustomOrderController.js';
import { ListProductVersionsController } from './modules/ListProductVersionsController.js';

class ProductControllerHandler {
    // Instancia cada controller do sub-módulo uma única vez na inicialização da classe
    public create = new CreateProductController();
    public list = new ListProductsController();
    public update = new UpdateProductController();
    public updateStatus = new UpdateProductStatusController();
    public reorder = new ReorderProductsController();
    public customOrder = new CustomOrderController();
    public listVersions = new ListProductVersionsController();
}

// Exporta uma única instância unificada pronta para ser acoplada às rotas (Singleton)
export const productController = new ProductControllerHandler();
