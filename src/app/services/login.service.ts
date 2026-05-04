import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  /**
   * Consumes the locations (sedes) based on the username.
   * @param usuario The username to search sedes for.
   * @returns An observable with the full HTTP response.
   */
  consumirSedes(usuario: string) {
    const ip = this.configService.getIp();
    const baseUrl = ip.endsWith('/') ? ip : `${ip}/`;
    const url = `${baseUrl}ws_ConsumirSedes`;

    return this.http.post(url, { usuario }, { observe: 'response' });
  }
}
