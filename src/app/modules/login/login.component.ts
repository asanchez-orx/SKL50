import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Slide {
  image: string;
}

import { Router } from '@angular/router';
import { ConfigService, AppConfig } from '../../services/config.service';
import { LoginService } from '../../services/login.service';
import { CredencialesService } from '../../services/credenciales.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  slides: Slide[] = [
    { image: 'assets/images/databank.png' },
    { image: 'assets/images/lis.png' },
    { image: 'assets/images/sia.png' },
    { image: 'assets/images/skylab.png' }
  ];

  currentSlide = 0;
  private timerId: any = null;

  sedes: any[] = [];
  private lastFetchedUsername = '';
  private destroy$ = new Subject<void>();
  private usernameSubject = new Subject<string>();

  loginData = {
    sede: '' as any,
    username: '',
    password: ''
  };

  showConfigModal = false;
  tempConfig: AppConfig = { wsIp: '' };
  isLoggingIn = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
    private configService: ConfigService,
    private loginService: LoginService,
    private credencialesService: CredencialesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('--- LOGIN COMPONENT V3.1 (Forcing Rebuild for Image) ---');
      this.startCarousel();
      this.setupUsernameDebounce();
    }
  }

  ngOnDestroy(): void {
    this.stopCarousel();
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupUsernameDebounce(): void {
    this.usernameSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(username => {
      if (username.trim()) {
        this.fetchSedes(username);
      } else {
        this.sedes = [];
      }
    });
  }

  onUsernameInput(event: any): void {
    this.usernameSubject.next(event.target.value);
  }

  onUsernameBlur(event: any): void {
    const username = event.target?.value || this.loginData.username;
    if (username && username.trim() && username !== this.lastFetchedUsername) {
      console.log('Fetching sedes on blur for:', username);
      this.fetchSedes(username);
    }
  }

  fetchSedes(usuario: string): void {
    if (!usuario || !usuario.trim()) {
      this.sedes = [];
      this.lastFetchedUsername = '';
      return;
    }

    if (usuario === this.lastFetchedUsername) return;
    this.lastFetchedUsername = usuario;

    this.loginService.consumirSedes(usuario).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.sedes = response.body;
          this.cdr.markForCheck();
        } else if (response.status === 204) {
          this.sedes = [];
          this.loginData.sede = '';
          Swal.fire({
            icon: 'warning',
            title: 'Usuario no existe',
            text: 'El usuario ingresado no existe.',
            confirmButtonColor: '#e8972b',
            heightAuto: false
          });
          this.cdr.markForCheck();
        }
      },
      error: (err: any) => {
        console.error('Error fetching sedes:', err);
        this.sedes = [];
        this.loginData.sede = '';
        Swal.fire({
          icon: 'error',
          title: 'Error en el webservice',
          text: 'No se pudo establecer conexión con el servicio de sedes.',
          confirmButtonColor: '#F25252',
          heightAuto: false
        });
        this.cdr.markForCheck();
      }
    });
  }

  startCarousel(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.stopCarousel();
    
    this.ngZone.runOutsideAngular(() => {
      this.timerId = setTimeout(() => {
        this.ngZone.run(() => {
          if (this.timerId) { // Verify timer is still valid
             this.nextSlide();
             this.startCarousel();
          }
        });
      }, 5000);
    });
  }

  stopCarousel(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.cdr.markForCheck();
  }

  setSlide(index: number): void {
    if (this.currentSlide === index) return;
    this.currentSlide = index;
    this.cdr.markForCheck();
    this.startCarousel();
  }

  onSubmit(): void {
    if (this.isLoggingIn) return;

    const { username, password, sede } = this.loginData;
    
    // Validación más robusta: que no estén vacíos
    if (!username?.trim() || !password?.trim() || sede === '' || sede === null) {
      console.warn('Formulario incompleto');
      return;
    }

    this.isLoggingIn = true;
    const idSede = Number(sede);

    console.log('Iniciando sesión para:', username, 'en sede:', idSede);

    this.credencialesService.consumirCredenciales(username, password, idSede).subscribe({
      next: (response: any) => {
        this.isLoggingIn = false;
        if (response.status === 200) {
          localStorage.setItem('currentUser', username);
          localStorage.setItem('currentSedeId', idSede.toString());
          this.router.navigate(['/home']);
        } else {
          Swal.fire({
            icon: 'info',
            title: 'No encontrado',
            text: 'Credenciales inválidas o sede no disponible.',
            confirmButtonColor: '#06b6d4',
            heightAuto: false
          });
        }
      },
      error: (err: any) => {
        this.isLoggingIn = false;
        console.error('Login error:', err);
        if (err.status === 500) {
          Swal.fire({
            icon: 'error',
            title: 'Error en el webservices',
            text: 'Hubo un problema interno en el servidor.',
            confirmButtonColor: '#F25252',
            heightAuto: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No encontrado',
            text: 'No se pudo validar el acceso en este momento.',
            confirmButtonColor: '#e8972b',
            heightAuto: false
          });
        }
      }
    });
  }

  openConfigModal(): void {
    console.log('Opening configuration...');
    this.tempConfig = { ...this.configService.getConfig() };
    this.showConfigModal = true;
    this.cdr.detectChanges();
  }

  closeConfigModal(): void {
    this.showConfigModal = false;
  }

  async saveConfig(): Promise<void> {
    // 1. Cerramos el modal primero de forma visual
    this.closeConfigModal();
    this.cdr.detectChanges();

    // 2. Mostramos la alerta de éxito de forma controlada y esperamos a que termine (2 segundos)
    await Swal.fire({
      icon: 'success',
      title: '¡Guardado con éxito!',
      text: 'La configuración ha sido actualizada correctamente.',
      confirmButtonColor: '#06b6d4',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      heightAuto: false
    });

    // 3. Guardamos la configuración. 
    // Al guardarse en config.json, el servidor de desarrollo (ng serve) recargará la página automáticamente.
    // Al hacerlo de último, nos aseguramos que la alerta se haya mostrado por completo.
    await this.configService.saveConfig(this.tempConfig);
  }
}
