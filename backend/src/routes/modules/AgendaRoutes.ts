import { Router } from 'express';
import { upload } from '../../config/multer.js';
import { appointmentController } from '../../controllers/appointment/AppointmentControllerHandler.js';
import { handleMediaUpload } from '../../utils/uploadHandler.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const agendaRouter = Router();

agendaRouter.use(isAuthenticated);

// Rota de Upload centralizada
agendaRouter.post('/upload', upload.single('file'), handleMediaUpload);

// Rotas da Agenda utilizando o Centralizador (Apenas 1 import!)
agendaRouter.get('/', appointmentController.list.handle);
agendaRouter.post('/', appointmentController.create.handle);
agendaRouter.put('/:id', appointmentController.update.handle);
agendaRouter.patch('/:id/order', appointmentController.updateOrder.handle);
agendaRouter.patch('/:id/status', appointmentController.updateStatus.handle);
agendaRouter.patch('/:id/sub-status', appointmentController.updateSubStatus.handle);
agendaRouter.delete('/:id', appointmentController.delete.handle);
agendaRouter.patch('/cascade-reschedule', appointmentController.cascadeReschedule.handle);

export { agendaRouter };
