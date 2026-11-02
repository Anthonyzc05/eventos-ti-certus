import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Eventos from './pages/Eventos';
import RutaProtegida from './components/RutaProtegida';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/eventos"
        element={
          <RutaProtegida>
            <Eventos />
          </RutaProtegida>
        }
      />
    </Routes>
  );
}
