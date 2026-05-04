import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface AppConfig {
  wsIp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig>({ wsIp: 'localhost' });
  config$ = this.configSubject.asObservable();

  private readonly CONFIG_URL = 'config.json';
  private readonly LOCAL_STORAGE_KEY = 'skl_ws_ip';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadConfig();
  }

  private async loadConfig() {
    if (isPlatformBrowser(this.platformId)) {
      // Try to load from localStorage first (user override)
      const savedIp = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (savedIp) {
        this.configSubject.next({ wsIp: savedIp });
        return;
      }
    }

    // Otherwise load from server
    try {
      const config = await firstValueFrom(
        this.http.get<AppConfig>(this.CONFIG_URL).pipe(
          catchError(() => of({ wsIp: '127.0.0.1' }))
        )
      );
      this.configSubject.next(config);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  async saveConfig(ip: string): Promise<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, ip);
    }

    this.configSubject.next({ wsIp: ip });

    // Try to save to server via API
    try {
      await firstValueFrom(
        this.http.post('/api/config', { wsIp: ip }).pipe(
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

  getIp(): string {
    return this.configSubject.value.wsIp;
  }
}
