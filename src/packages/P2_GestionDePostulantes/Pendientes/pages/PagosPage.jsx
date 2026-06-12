import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, CreditCard, ShieldCheck, X, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API = 'http://localhost:8000/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function PagosPage() {
  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  
  // Estados para simular PayPal
  const [paypalStep, setPaypalStep] = useState(1);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/postulantes-pago`, { headers: getHeaders() });
      setPostulantes(data);
    } catch (e) {
      console.error('Error cargando pagos:', e);
    } finally {
      setLoading(false);
    }
  };

  const confirmarPago = async () => {
    setProcesandoPago(true);
    try {
      await axios.post(`${API}/postulantes/${selectedPostulante.id}/pagar`, {}, { headers: getHeaders() });
      toast.success('Pago procesado exitosamente vía PayPal.');
      setSelectedPostulante(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'No se pudo procesar el pago.');
    } finally {
      setProcesandoPago(false);
    }
  };

  const filtered = postulantes
    .filter(p =>
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ci?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Primero ordenar por estado de pago (Pendientes = false van primero)
      if (a.tiene_pago === b.tiene_pago) {
        // Luego ordenar alfabéticamente por nombre
        return a.nombre.localeCompare(b.nombre);
      }
      return a.tiene_pago ? 1 : -1;
    });

  const pagados = postulantes.filter(p => p.tiene_pago).length;
  const pendientes = postulantes.filter(p => !p.tiene_pago).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pagos de Matrícula</h2>
          <p className="text-sm text-gray-500">Solo se listan postulantes con documentación 100% completa.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Habilitados</p>
          <p className="text-3xl font-bold text-gray-800">{postulantes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ya pagaron</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-800">{pagados}</p>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
              {postulantes.length > 0 ? Math.round((pagados / postulantes.length) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pendientes</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-800">{pendientes}</p>
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              {postulantes.length > 0 ? Math.round((pendientes / postulantes.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o CI..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg sm:text-sm bg-gray-50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Cargando postulantes habilitados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Postulante</th>
                  <th className="px-6 py-4">Documentos</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4 text-center">Estado de Pago</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => {
                  const initials = p.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200 flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{p.nombre}</p>
                            <p className="text-xs text-gray-500 font-mono">CI: {p.ci}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {p.docs_entregados}/{p.docs_total} Completo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {p.correo || <span className="italic text-gray-400">Sin correo</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {p.tiene_pago ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PAGADO
                            </span>
                            {p.pago && (
                              <span className="text-[10px] text-gray-400">
                                {p.pago.fecha} · Bs. {parseFloat(p.pago.monto).toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                            <Clock className="w-3.5 h-3.5" /> PENDIENTE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!p.tiene_pago ? (
                          <button
                            onClick={() => {
                              setSelectedPostulante(p);
                              setPaypalStep(1);
                              setPaypalEmail('');
                              setPaypalPassword('');
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-green-600/20"
                          >
                            <CreditCard className="w-4 h-4" />
                            Registrar Pago
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Ya procesado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-gray-300" />
                        <p className="font-medium">No hay postulantes con documentación completa aún.</p>
                        <p className="text-sm">Valida los documentos en la sección "Documentos" primero.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PayPal Simulated Modal */}
      {selectedPostulante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header PayPal */}
            <div className="bg-[#003087] p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                {/* Logo simulado */}
                <span className="font-bold text-xl italic tracking-tight">
                  <span className="text-white">Pay</span><span className="text-[#0079C1]">Pal</span>
                </span>
                <span className="text-xs bg-[#001f5a] px-2 py-0.5 rounded text-white/80 border border-white/10">Sandbox</span>
              </div>
              <button onClick={() => setSelectedPostulante(null)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paypalStep === 1 ? (
              /* Paso 1: Login de PayPal */
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-gray-800">Inicia sesión en PayPal</h3>
                  <p className="text-sm text-gray-500">Paga a UAGRM CUP de forma segura</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0079C1] focus:border-[#0079C1] outline-none transition-all"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Contraseña"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0079C1] focus:border-[#0079C1] outline-none transition-all"
                      value={paypalPassword}
                      onChange={(e) => setPaypalPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if(!paypalEmail || !paypalPassword) return toast.error('Ingresa credenciales de prueba');
                    setPaypalStep(2);
                  }}
                  className="w-full py-3 bg-[#0079C1] hover:bg-[#005a8f] text-white font-bold rounded-full transition-colors shadow-lg shadow-[#0079C1]/30"
                >
                  Iniciar Sesión
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Esta es una pasarela simulada. Ingresa cualquier dato.</p>
                </div>
              </div>
            ) : (
              /* Paso 2: Confirmación de Pago */
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Hola, <span className="font-semibold text-gray-700">{paypalEmail}</span></p>
                  <p className="text-3xl font-light text-gray-800 mt-2">$45.00 USD</p>
                  <p className="text-xs text-gray-400 mt-1">Equivalente a Bs. 300.00</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pagar a:</span>
                    <span className="font-semibold text-gray-800">UAGRM CUP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Postulante:</span>
                    <span className="font-medium text-gray-800">{selectedPostulante.nombre}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-gray-500">Método de pago:</span>
                    <span className="font-medium flex items-center gap-1 text-gray-800">
                      <CreditCard className="w-4 h-4 text-[#0079C1]"/> Saldo PayPal
                    </span>
                  </div>
                </div>

                <button
                  onClick={confirmarPago}
                  disabled={procesandoPago}
                  className="w-full py-3 bg-[#0079C1] hover:bg-[#005a8f] text-white font-bold rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#0079C1]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {procesandoPago ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando pago...</>
                  ) : (
                    'Pagar Ahora'
                  )}
                </button>
                <button
                  onClick={() => setPaypalStep(1)}
                  className="w-full py-2 text-[#0079C1] font-semibold text-sm hover:underline"
                >
                  Cancelar y volver
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
