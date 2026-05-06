import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  username: string = '';
  showSelectionModal: boolean = true;
  isSidebarCollapsed: boolean = true;

  sessionTime: string = '00:00:00';
  private secondsElapsed: number = 0;
  private timerInterval: any;

  taquillas: any[] = [];
  servicios: any[] = [];

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  selectionData = {
    idModulo: '',
    modulo: '',
    idServicio: '',
    servicio: ''
  };

  openSelectionModal() {
    this.showSelectionModal = true;
    this.fetchServicios();
  }

  closeSelectionModal() {
    // Solo permitimos cerrar si ya hay una selección previa
    if (this.selectionData.modulo && this.selectionData.servicio) {
      this.showSelectionModal = false;
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private turnosService: TurnosService
  ) { }


  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('currentUser') || 'Usuario';

      // Verificar si ya existe una sesión guardada
      const savedModulo = localStorage.getItem('modulo');
      const savedServicio = localStorage.getItem('servicio');
      const savedIdModulo = localStorage.getItem('idmodulo');
      const savedIdServicio = localStorage.getItem('idservicio');

      if (savedModulo && savedServicio) {
        this.selectionData.modulo = savedModulo;
        this.selectionData.servicio = savedServicio;
        this.selectionData.idServicio = savedIdServicio || '';
        this.showSelectionModal = false;
        // Timer no longer starts automatically here
      } else {
        this.showSelectionModal = true;
        this.fetchServicios();
      }

      // Escuchar el trigger para iniciar el cronómetro
      this.turnosService.startTimer$.subscribe(() => {
        this.startTimer();
      });

      // Escuchar el trigger para pausar el cronómetro
      this.turnosService.stopTimer$.subscribe(() => {
        this.stopTimer();
      });
    }
  }

  fetchServicios() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const idSede = localStorage.getItem('currentSedeId');
    if (!idSede) {
      console.warn('No se encontró currentSedeId para cargar servicios');
      return;
    }

    this.turnosService.getServicios(idSede).subscribe({
      next: (data: any) => {
        this.servicios = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching servicios:', err);
      }
    });
  }

  onServicioChange() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const idSede = localStorage.getItem('currentSedeId');
    if (!idSede) return;

    // Al cambiar de servicio, reseteamos la taquilla seleccionada
    this.selectionData.idModulo = '';
    this.selectionData.modulo = '';
    this.taquillas = [];

    this.turnosService.getTaquillas(idSede).subscribe({
      next: (data: any) => {
        this.taquillas = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching taquillas:', err);
      }
    });
  }

  private startTimer() {
    if (this.timerInterval) return;

    this.secondsElapsed = 0; // Iniciar desde cero
    
    this.timerInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.secondsElapsed++;
        
        const h = Math.floor(this.secondsElapsed / 3600);
        const m = Math.floor((this.secondsElapsed % 3600) / 60);
        const s = this.secondsElapsed % 60;

        this.sessionTime = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
        this.cdr.detectChanges();
      });
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  confirmSelection() {
    if (this.selectionData.idModulo && this.selectionData.idServicio) {
      this.showSelectionModal = false;
      if (isPlatformBrowser(this.platformId)) {
        // Encontrar nombres para mostrar
        const selectedS = this.servicios.find(s => s.idServicio == this.selectionData.idServicio);
        const selectedT = this.taquillas.find(t => t.idTaquilla == this.selectionData.idModulo);
        
        this.selectionData.servicio = selectedS?.nomServicio || '';
        this.selectionData.modulo = selectedT?.nomTaquilla || '';

        localStorage.setItem('idmodulo', this.selectionData.idModulo);
        localStorage.setItem('modulo', this.selectionData.modulo);
        localStorage.setItem('idservicio', this.selectionData.idServicio);
        localStorage.setItem('servicio', this.selectionData.servicio);
        
        // Timer no longer starts here, it starts from TurnosComponent
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.sessionTime = '00:00:00';
      this.secondsElapsed = 0;
    }
  }
  // Menú dinámico para el sidebar
  menuItems = [
    { label: 'Turnos', icon: 'M19 4h-1V3c0-.6-.4-1-1-1H7c-.6 0-1 .4-1 1v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 14c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm1-8h-2v4.5l3.2 1.9.8-1.3-2.5-1.5V10z', route: '/home/turnos', active: true },
    { label: 'Entrevista', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-8v-2h8v2zm0-4h-8v-2h8v2zm-3-5V3.5L18.5 9H13z', route: '/home/entrevista', active: false },
    { label: 'Dispensar - Toma', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.88 4.88c-1.04.88-2.39 1.41-3.88 1.41-1.49 0-2.84-.53-3.88-1.41L12 15l3.88 1.88z', route: '/home/dispensar', active: false },
    { label: 'Módulos', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', route: '/home/modulos', active: false },
    { label: 'Configuración', icon: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z', route: '/home/configuracion', active: false }
  ];
}
