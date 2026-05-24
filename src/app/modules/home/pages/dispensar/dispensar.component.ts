import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dispensar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dispensar.component.html',
  styleUrl: './dispensar.component.scss'
})
export class DispensarComponent {
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
    { nombre: 'SANGRE TOTAL CON EDTA', subtitulo: 'TAPA LILA', id: '202605031000-11', checked: true, cantidad: 1 },
    { nombre: 'SANGRE TOTAL CON EDTA', subtitulo: 'TAPA LILA', id: '202605031000-11', checked: true, cantidad: 1 },
    { nombre: 'SANGRE TOTAL CON EDTA', subtitulo: 'TAPA LILA', id: '202605031000-11', checked: true, cantidad: 1 },
    { nombre: 'SANGRE TOTAL CON EDTA', subtitulo: 'TAPA LILA', id: '202605031000-11', checked: true, cantidad: 1 },
    { nombre: 'SANGRE TOTAL CON EDTA', subtitulo: 'TAPA LILA', id: '202605031000-11', checked: true, cantidad: 1 }


  ];

  constructor(private router: Router) { }

  backToTurnos() {
    this.router.navigate(['/home/turnos']);
  }
}
