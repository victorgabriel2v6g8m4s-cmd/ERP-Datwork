import { CreateProductService } from './modules/CreateProductService.js';
import { ListProductVersionsService } from './modules/ListProductVersionsService.js';
import { ReorderProductsService } from './modules/ReorderProductsService.js';
import { UpdateProductService } from './modules/UpdateProductService.js';
import { CustomOrderService } from "./modules/CustomOrderService.js";
import { UpdateProductStatusService } from './modules/UpdateProductStatusService.js';

class ProductServiceHandler {
  public create = new CreateProductService();
  public listVersions = new ListProductVersionsService();
  public reorder = new ReorderProductsService();
  public customOrder = new CustomOrderService();
  public update = new UpdateProductService();
  public updateStatus = new UpdateProductStatusService();
}

export const productService = new ProductServiceHandler();
