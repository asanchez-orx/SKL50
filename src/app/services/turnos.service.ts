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
  /**
   * Obtiene los servicios disponibles para un módulo y sede.
   * @param idSede El ID de la sede actual.
   * @param codModulo El código del módulo (por defecto "4000").
   */
  getServicios(idSede: string, codModulo: string = "4000") {
    const ip = this.configService.getIp();
    const baseUrl = ip.endsWith('/') ? ip : `${ip}/`;
    const url = `${baseUrl}wsPtosAtencionxModulo`;

    return this.http.post<any[]>(url, { codModulo, idSede });
  }

  /**
   * Obtiene las taquillas (puntos de atención) asociadas a una sede.
   * @param idSede El ID de la sede actual.
   * @param codModulo El código del módulo (por defecto "4000").
   */
  getTaquillas(idSede: string, codModulo: string = "4000") {
    const ip = this.configService.getIp();
    const baseUrl = ip.endsWith('/') ? ip : `${ip}/`;
    const url = `${baseUrl}wsTaquillaxServicio/${idSede}`;

    return this.http.post<any[]>(url, { codModulo, idSede });
  }

  /**
   * Obtiene los turnos disponibles para una sede, taquilla y servicio.
   * @param idSede ID de la sede.
   * @param idTaquilla ID de la taquilla (idModulo).
   * @param idServicio ID del servicio.
   */
  getTurnosDisponibles(idSede: string, idTaquilla: string, idServicio: string) {
    const ip = this.configService.getIp();
    const baseUrl = ip.endsWith('/') ? ip : `${ip}/`;
    const url = `${baseUrl}wsTurnosDisponibles`;

    return this.http.post<any[]>(url, { idSede, idTaquilla, idServicio });
  }
}
