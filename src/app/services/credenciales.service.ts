import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class CredencialesService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  /**
   * Validates the user credentials.
   * @param usuario The username.
   * @param password The password.
   * @param idSede The ID of the selected sede.
   * @returns An observable with the full HTTP response.
   */
  consumirCredenciales(usuario: string, password: string, idSede: number) {
    const baseUrl = this.configService.getIp();
    const url = `${baseUrl}/api/v1/besigabi/skl/consumirCredenciales`;

    return this.http.post(url, { usuario, contrasena: password }, { observe: 'response' });
  }
}
