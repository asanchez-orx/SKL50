import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { map, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private startTimerSubject = new Subject<void>();
  private stopTimerSubject = new Subject<void>();

  startTimer$ = this.startTimerSubject.asObservable();
  stopTimer$ = this.stopTimerSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  triggerStartTimer() {
    this.startTimerSubject.next();
  }

  triggerStopTimer() {
    this.stopTimerSubject.next();
  }

  /**
   * Obtiene los puntos de atención (taquillas) para un módulo y sede específicos.
   * @param idSede El ID de la sede actual.
   * @param codModulo El código del módulo (por defecto "4000").
   */
  getServicios(idSede: string | number, codModulo: string | number = 4000) {
    const baseUrl = this.configService.getIp();
    const url = `${baseUrl}/api/v1/besigabi/skl/serviciosSiga`;

    return this.http.post<any[]>(url, {
      idSede: Number(idSede),
      codModulo: Number(codModulo)
    });
  }

  /**
   * Obtiene las taquillas (puntos de atención) asociadas a una sede.
   * @param idSede El ID de la sede actual.
   * @param codModulo El código del módulo (por defecto "4000").
   */
  getTaquillas(idSede: string | number, codModulo: string | number = 4000) {
    const baseUrl = this.configService.getIp();
    const url = `${baseUrl}/api/v1/besigabi/skl/taquillas`;

    return this.http.post<any[]>(url, {
      idSede: Number(idSede),
      codModulo: Number(codModulo)
    });
  }

  /**
   * Obtiene los turnos disponibles para una sede, taquilla y servicio.
   * @param idSede ID de la sede.
   * @param idTaquilla ID de la taquilla (idModulo).
   * @param idServicio ID del servicio.
   */
  getTurnosDisponibles(idSede: string | number, idTaquilla: string | number, idServicio: string | number) {
    const baseUrl = this.configService.getIp();
    const url = `${baseUrl}/api/v1/besigabi/skl/turnosDisponibles`;

    return this.http.post<any[]>(url, {
      idSede: Number(idSede),
      idTaquilla: Number(idTaquilla),
      idServicio: Number(idServicio)
    });
  }
}
