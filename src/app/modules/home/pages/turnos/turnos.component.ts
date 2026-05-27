import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../../services/turnos.service';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss'
})
export class TurnosComponent implements OnInit {
  showCallModal = false;
  selectedTurn: any = null;
  currentPlane: 'LISTA' | 'ATENCION' = 'LISTA';
  isPaused: boolean = true;

  waitingTurns: any[] = [];

  // Datos para la pantalla de atención (MOCK)
  patientData = {
    nombre: 'KAKAKAK NANANAN',
    tipoId: 'CEDULA DE CIUDADANIA',
    sexo: 'Femenino',
    fechaNac: '20260502',
    identificacion: '8888',
    email: 'test@example.com',
    direccion: 'Calle Falsa 123',
    telefono: '+57 300 000 0000',
    cama: 'AM-2',
    piso: '3',
    fechaOrden: '20260503',
    tipoOrden: 'Prioritario',
    noOrden: '202605031000',
    ordenCodigo: 'AM-2',
    servicio: 'AMBULATORIO-CAMPIN',
    tiempoAtencion: '00:15:48'
  };

  tests = [
    { nombre: 'SUERO AYUNAS', subtitulo: 'TAPA AMARILLA', id: '202605031000-1', checked: true, cantidad: 1 },
    { nombre: 'SANGRE TOTAL CON EDTA', subtitulo: 'TAPA LILA', id: '202605031000-11', checked: true, cantidad: 1 }
  ];

  constructor(
    private router: Router,
    private turnosService: TurnosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadWaitingTurns();
    }
  }

  loadWaitingTurns() {
    const idSede = localStorage.getItem('currentSedeId');
    const idModulo = localStorage.getItem('idmodulo');
    const idServicio = localStorage.getItem('idservicio');

    if (!idSede || !idModulo || !idServicio) {
      console.warn('Configuración incompleta para cargar turnos (Sede, Módulo o Servicio faltante)');
      return;
    }

    this.turnosService.getTurnosDisponibles(idSede, idModulo, idServicio).subscribe({
      next: (data: any) => {
        if (data && Array.isArray(data)) {
          this.waitingTurns = data.map((t: any) => ({
            numero: `${t.codTipoTurno} - ${t.numeroTurno}`,
            tipo: t.nomTipoTurno,
            paciente: `${t.paciente?.nombre1 || ''} ${t.paciente?.apellido1 || ''}`.trim() || 'Desconocido',
            prioridad: 'P' + (t.nPrioridad || 3),
            orden: t.numeroOrden,
            espera: `${t.minutosEspera} MIN`,
            tiempo: t.tiempo
          }));
        }
      },
      error: (err: any) => {
        console.error('Error cargando turnos disponibles:', err);
      }
    });
  }

  onStartAttention() {
    this.isPaused = false;
    this.turnosService.triggerStartTimer();
    this.loadWaitingTurns();
  }

  pauseAttention() {
    this.isPaused = true;
    this.turnosService.triggerStopTimer();
  }

  callTurn(turn: any) {
    this.selectedTurn = turn;
    this.showCallModal = true;
  }

  closeCallModal() {
    this.showCallModal = false;
    this.selectedTurn = null;
  }

  attendTurn() {
    this.showCallModal = false;
    this.router.navigate(['/home/dispensar']);
  }

  backToList() {
    this.currentPlane = 'LISTA';
  }
}
