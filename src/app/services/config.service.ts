import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface AppConfig {
  wsIp: string;
  wsPort?: string;
  usaCalificacionServicio?: number;
  usaImpresora?: boolean;
  usaPuertosCom?: boolean;
  usaTipoImpresion?: boolean;
  usaPantallas?: boolean;
  usaConsentimientoInformado?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig>({ 
    wsIp: 'localhost',
    wsPort: '',
    usaCalificacionServicio: 0,
    usaImpresora: false,
    usaPuertosCom: false,
    usaTipoImpresion: false,
    usaPantallas: false,
    usaConsentimientoInformado: 0
  });
  config$ = this.configSubject.asObservable();

  private readonly CONFIG_URL = 'config.json';
  private readonly LOCAL_STORAGE_KEY = 'skl_ws_ip';
  private readonly LOCAL_STORAGE_PORT_KEY = 'skl_ws_port';
  private readonly LOCAL_STORAGE_EXTRAS_KEY = 'skl_extra_config';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadConfig();
  }

  private async loadConfig() {
    let currentConfig = this.configSubject.value;

    if (isPlatformBrowser(this.platformId)) {
      // Try to load from localStorage first (user override)
      const savedIp = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      const savedPort = localStorage.getItem(this.LOCAL_STORAGE_PORT_KEY);
      const extraConfigStr = localStorage.getItem(this.LOCAL_STORAGE_EXTRAS_KEY);
      
      let extraConfig = {};
      if (extraConfigStr) {
        try {
          extraConfig = JSON.parse(extraConfigStr);
        } catch(e) {}
      }

      if (savedIp || savedPort || extraConfigStr) {
        this.configSubject.next({ 
          ...currentConfig, 
          wsIp: savedIp || currentConfig.wsIp,
          wsPort: savedPort ?? currentConfig.wsPort,
          ...extraConfig 
        });
        return;
      }
    }

    // Otherwise load from server
    try {
      const config = await firstValueFrom(
        this.http.get<AppConfig>(this.CONFIG_URL).pipe(
          catchError(() => of(currentConfig))
        )
      );
      this.configSubject.next({ ...currentConfig, ...config });
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  async saveConfig(config: AppConfig): Promise<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, config.wsIp);
      localStorage.setItem(this.LOCAL_STORAGE_PORT_KEY, config.wsPort ?? '');
      localStorage.setItem(this.LOCAL_STORAGE_EXTRAS_KEY, JSON.stringify({
        usaCalificacionServicio: config.usaCalificacionServicio,
        usaImpresora: config.usaImpresora,
        usaPuertosCom: config.usaPuertosCom,
        usaTipoImpresion: config.usaTipoImpresion,
        usaPantallas: config.usaPantallas,
        usaConsentimientoInformado: config.usaConsentimientoInformado
      }));
    }

    this.configSubject.next(config);

    // Try to save to server via API
    try {
      const configToSave = {
        wsIp: config.wsIp,
        wsPort: config.wsPort,
        usaCalificacionServicio: config.usaCalificacionServicio,
        usaConsentimientoInformado: config.usaConsentimientoInformado
      };

      await firstValueFrom(
        this.http.post('/api/config', configToSave).pipe(
          tap(() => console.log('Config saved to server')),
          catchError(err => {
            console.warn('Could not save config to server (this is expected in dev)', err);
            return of(null);
          })
        )
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  getConfig(): AppConfig {
    return this.configSubject.value;
  }

  getIp(): string {
    const { wsIp, wsPort } = this.configSubject.value;
    const ip = wsIp || 'localhost';
    const cleanIp = ip.endsWith('/') ? ip.slice(0, -1) : ip;
    const port = wsPort && wsPort.trim() ? `:${wsPort.trim()}` : '';
    // If IP already has protocol prefix, keep it; otherwise don't add one
    const hasProtocol = /^https?:\/\//i.test(cleanIp);
    const base = hasProtocol ? cleanIp : cleanIp;
    return `${base}${port}`;
  }
}
