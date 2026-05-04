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
    const ip = this.configService.getIp();
    const baseUrl = ip.endsWith('/') ? ip : `${ip}/`;
    const url = `${baseUrl}ws_ConsumirCredenciales`;

    return this.http.post(url, { usuario, password, idSede }, { observe: 'response' });
  }
}
