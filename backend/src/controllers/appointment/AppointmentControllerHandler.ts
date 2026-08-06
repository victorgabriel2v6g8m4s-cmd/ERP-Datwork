import { CreateAppointmentController } from './modules/CreateAppointmentController.js';
import { ListAppointmentsController } from './modules/ListAppointmentsController.js';
import { UpdateAppointmentController } from './modules/UpdateAppointmentController.js';
import { UpdateAppointmentOrderController } from './modules/UpdateAppointmentOrderController.js';
import { UpdateAppointmentStatusController } from './modules/UpdateAppointmentStatusController.js';
import { UpdateSubStatusController } from './modules/UpdateSubStatusController.js';
import { DeleteAppointmentController } from './modules/DeleteAppointmentController.js';
import { CascadeRescheduleController } from './modules/CascadeRescheduleController.js';

class AppointmentControllerHandler {
    // Instancia todos os controllers do sub-módulo uma única vez na inicialização da classe
    public create = new CreateAppointmentController();
    public list = new ListAppointmentsController();
    public update = new UpdateAppointmentController();
    public updateOrder = new UpdateAppointmentOrderController();
    public updateStatus = new UpdateAppointmentStatusController();
    public updateSubStatus = new UpdateSubStatusController();
    public delete = new DeleteAppointmentController();
    public cascadeReschedule = new CascadeRescheduleController();
}

// Exporta uma única instância pronta para ser acoplada ao arquivo de rotas (Singleton)
export const appointmentController = new AppointmentControllerHandler();
