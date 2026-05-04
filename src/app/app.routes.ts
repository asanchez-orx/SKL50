import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { HomeComponent } from './modules/home/home.component';
import { TurnosComponent } from './modules/home/pages/turnos/turnos.component';
import { DispensarComponent } from './modules/home/pages/dispensar/dispensar.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: 'turnos', component: TurnosComponent },
      { path: 'dispensar', component: DispensarComponent },
      { path: '', redirectTo: 'turnos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
