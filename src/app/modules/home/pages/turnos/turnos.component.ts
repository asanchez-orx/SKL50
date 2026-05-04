import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss'
})
export class TurnosComponent {
  showCallModal = false;
  selectedTurn: any = null;
  currentPlane: 'LISTA' | 'ATENCION' = 'LISTA';

  // Lista de 20 turnos (1 al 20)
  waitingTurns = Array.from({ length: 20 }, (_, i) => ({
    numero: `T-${i + 1}`,
    tipo: i % 3 === 0 ? 'ADULTO MAYOR' : 'GENERAL',
    paciente: `PACIENTE PRUEBA ${i + 1}`,
    prioridad: 'P' + ((i % 3) + 1),
    orden: `20260503${1000 + i}`,
    espera: `${(i + 1) * 2} MIN`
  }));

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

  constructor(private router: Router) {}

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
