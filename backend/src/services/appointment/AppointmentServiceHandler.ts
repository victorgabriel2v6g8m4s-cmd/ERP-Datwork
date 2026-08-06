import { CreateAppointmentService } from "./modules/CreateAppointmentService.js";
import { ListAppointmentsService } from "./modules/ListAppointmentsService.js";
import { DeleteAppointmentService } from "./modules/DeleteAppointmentService.js";
import { UpdateAppointmentService } from "./modules/UpdateAppointmentService.js";
import { UpdateAppointmentStatusService } from "./modules/UpdateAppointmentStatusService.js";
import { UpdateSubStatusService } from "./modules/UpdateSubStatusService.js";
import { CascadeRescheduleService } from "./modules/CascadeRescheduleService.js";
import { UpdateAppointmentOrderService } from "./modules/UpdateAppointmentOrderService.js";

class AppointmentServiceHandler {
    public create = new CreateAppointmentService();
    public list = new ListAppointmentsService();
    public delete = new DeleteAppointmentService();
    public update = new UpdateAppointmentService();
    public updateStatus = new UpdateAppointmentStatusService();
    public updateSubStatus = new UpdateSubStatusService();
    public cascadeReschedule = new CascadeRescheduleService();
    public updateOrder = new UpdateAppointmentOrderService();
}

export const appointmentService = new AppointmentServiceHandler();