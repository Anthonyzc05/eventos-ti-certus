import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Eventos from './pages/Eventos';
import EventoForm from './pages/EventoForm';
import Inscripcion from './pages/Inscripcion';
import Participantes from './pages/Participantes';
import Difusion from './pages/Difusion';
import RutaProtegida from './components/RutaProtegida';
import PanelLayout from './components/PanelLayout';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/inscripcion/:id" element={<Inscripcion />} />
      <Route
        element={
          <RutaProtegida>
            <PanelLayout />
          </RutaProtegida>
        }
      >
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/eventos/nuevo" element={<EventoForm />} />
        <Route path="/eventos/:id/editar" element={<EventoForm />} />
        <Route path="/eventos/:id/participantes" element={<Participantes />} />
        <Route path="/eventos/:id/difusion" element={<Difusion />} />
      </Route>
    </Routes>
  );
}