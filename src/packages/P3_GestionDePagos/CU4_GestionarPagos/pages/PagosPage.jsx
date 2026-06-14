import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, CreditCard, ShieldCheck, X, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';

const API = 'http://localhost:8000/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function PagosPage() {
  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  
  // Estados para simular Tarjeta de Crédito
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [focus, setFocus] = useState('');
  
  const [paypalStep, setPaypalStep] = useState(1);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');
  
  // Estados para el flujo interno de la tarjeta en PayPal
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isCardSaved, setIsCardSaved] = useState(false);

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
      toast.success('Pago procesado exitosamente.');
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
                      {!isCoordinador && (
                        <td className="px-6 py-4 text-right">
                          {!p.tiene_pago ? (
                            <button
                              onClick={() => {
                                setSelectedPostulante(p);
                                setCardNumber('');
                                setExpiry('');
                                setCvc('');
                                setCardName('');
                                setFocus('');
                                setPaypalStep(1);
                                setPaypalEmail('');
                                setPaypalPassword('');
                                setIsAddingCard(false);
                                setIsCardSaved(false);
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
                      )}
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

      {/* PayPal Realistic Modal */}
      {selectedPostulante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          
          {paypalStep === 1 ? (
            /* STEP 1: LOGIN PAYPAL */
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 relative">
              <button onClick={() => setSelectedPostulante(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="p-10 space-y-7 flex flex-col items-center">
                <span className="font-extrabold text-4xl italic tracking-tighter text-[#003087] mb-2">
                  Pay<span className="text-[#0079C1]">Pal</span>
                </span>
                
                <div className="w-full space-y-4">
                  <input
                    type="text"
                    placeholder="Correo electrónico o número de celular"
                    className="w-full px-4 py-3.5 border border-gray-400 rounded focus:ring-1 focus:ring-[#0079C1] focus:border-[#0079C1] outline-none transition-all text-base placeholder-gray-500"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full px-4 py-3.5 border border-gray-400 rounded focus:ring-1 focus:ring-[#0079C1] focus:border-[#0079C1] outline-none transition-all text-base placeholder-gray-500"
                    value={paypalPassword}
                    onChange={(e) => setPaypalPassword(e.target.value)}
                  />
                  <div className="text-left pt-1">
                    <span className="text-[#0070ba] text-sm font-bold cursor-pointer hover:underline">¿Ha olvidado su contraseña?</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if(!paypalEmail || !paypalPassword) return toast.error('Ingrese sus credenciales');
                    setPaypalStep(2);
                  }}
                  className="w-full py-3 bg-[#0070ba] hover:bg-[#003087] text-white font-bold rounded-full transition-colors text-lg mt-2"
                >
                  Iniciar sesión
                </button>

                <div className="w-full flex items-center gap-3 py-1">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <span className="text-gray-500 font-medium text-sm">o</span>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>

                <button className="w-full py-3 bg-white border-2 border-[#2c2e2f] text-[#2c2e2f] font-bold rounded-full hover:bg-gray-50 transition-colors text-lg">
                  Registrarse
                </button>
                
                <div className="text-xs text-gray-400 pt-2 text-center">
                  Español | English | Français | 中文
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: AGREGAR TARJETA / PAGAR */
            <div className="bg-[#f5f7fa] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-right-8 duration-300 border border-gray-200 max-h-[95vh] flex flex-col">
              {/* Header */}
              <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center relative flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="font-extrabold text-2xl italic tracking-tighter text-[#003087]">
                    Pay<span className="text-[#0079C1]">Pal</span>
                  </span>
                </div>
                <button onClick={() => setSelectedPostulante(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-5 md:p-6 space-y-4 overflow-y-auto">
                
                <div className="text-center space-y-1 pb-2">
                  <h3 className="font-bold text-gray-900 text-lg">Configure una vez. Pague más rápido la próxima vez.</h3>
                  <p className="text-sm text-gray-500 leading-tight">
                    Guardaremos su elección para los pagos futuros a UAGRM CUP. Puede cambiarla en cualquier momento en la configuración de PayPal.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white cursor-pointer" onClick={() => !isCardSaved && setIsAddingCard(true)}>
                    <span className="font-bold text-gray-900 text-lg">Pagar con</span>
                    <span className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isAddingCard ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </span>
                  </div>

                  {!isAddingCard && !isCardSaved && (
                    <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsAddingCard(true)}>
                      <div className="text-[#0070ba]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-gray-800 font-medium">Agregar tarjeta</span>
                    </div>
                  )}

                  {isCardSaved && !isAddingCard && (
                    <div className="p-4 flex items-center gap-3 bg-blue-50/50">
                      <input type="radio" checked readOnly className="w-4 h-4 text-[#0070ba] focus:ring-[#0070ba]" />
                      <div className="flex-1 flex flex-col">
                        <span className="text-gray-900 font-semibold flex items-center gap-2">
                          {cardNumber[0] === '4' ? 'Visa' : (cardNumber[0] === '5' ? 'Mastercard' : 'Tarjeta')} terminada en •••• {cardNumber.replace(/\s/g, '').slice(-4) || '1234'}
                        </span>
                        <span className="text-gray-500 text-xs">UAGRM CUP • $45.00 USD</span>
                      </div>
                      {cardNumber[0] === '4' && <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 object-contain" />}
                      {cardNumber[0] === '5' && <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain" />}
                    </div>
                  )}

                  {isAddingCard && (
                    <div className="p-4 space-y-4 border-t border-gray-100 bg-gray-50/30">
                      {/* Tarjeta Interactiva (Escalada para que no ocupe tanto espacio) */}
                      <div className="flex justify-center -mt-8 -mb-6 transform scale-[0.70] sm:scale-[0.75] origin-center">
                        <Cards
                          number={cardNumber}
                          expiry={expiry}
                          cvc={cvc}
                          name={cardName || 'TITULAR DE TARJETA'}
                          focused={focus}
                        />
                      </div>

                      {/* Formulario de Tarjeta */}
                      <div className="space-y-3">
                        <div>
                          <input
                            type="tel"
                            maxLength="19"
                            name="number"
                            placeholder="Número de Tarjeta"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#0079C1] focus:border-[#0079C1] outline-none transition-all font-mono text-sm tracking-widest"
                            value={cardNumber}
                            onFocus={(e) => setFocus(e.target.name)}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              setCardNumber(val);
                            }}
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            name="name"
                            placeholder="Nombre en la tarjeta"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#0079C1] focus:border-[#0079C1] outline-none transition-all uppercase text-sm font-medium"
                            value={cardName}
                            onFocus={(e) => setFocus(e.target.name)}
                            onChange={(e) => setCardName(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="tel"
                              name="expiry"
                              maxLength="5"
                              placeholder="Vencimiento (MM/YY)"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#0079C1] focus:border-[#0079C1] outline-none transition-all font-mono text-sm tracking-widest text-center"
                              value={expiry}
                              onFocus={(e) => setFocus(e.target.name)}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                                setExpiry(val);
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="tel"
                              name="cvc"
                              maxLength="4"
                              placeholder="CVC"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#0079C1] focus:border-[#0079C1] outline-none transition-all font-mono text-sm tracking-widest text-center"
                              value={cvc}
                              onFocus={(e) => setFocus(e.target.name)}
                              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                            />
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            if(!cardNumber || !expiry || !cvc || !cardName) {
                              toast.error('Complete los datos de la tarjeta');
                              return;
                            }
                            if(cardNumber.replace(/\s/g, '').length < 15) {
                              toast.error('Número de tarjeta inválido');
                              return;
                            }
                            setIsAddingCard(false);
                            setIsCardSaved(true);
                            toast.success('Tarjeta vinculada a su cuenta de PayPal');
                          }}
                          className="w-full py-2.5 bg-white border border-[#0070ba] text-[#0070ba] font-bold rounded-full hover:bg-blue-50 transition-colors text-sm mt-2"
                        >
                          Vincular Tarjeta
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[13px] text-gray-800 text-center font-medium px-2">
                    Consulte las <span className="text-[#0070ba] hover:underline cursor-pointer">políticas de PayPal</span> para conocer sus derechos sobre las formas de pago.
                  </p>
                  
                  <button
                    onClick={() => {
                      if (!isCardSaved) {
                        toast.error('Debe agregar y vincular una tarjeta primero');
                        setIsAddingCard(true);
                        return;
                      }
                      confirmarPago();
                    }}
                    disabled={procesandoPago}
                    className="w-full py-3.5 bg-[#003087] hover:bg-[#001c53] text-white font-bold rounded-full flex items-center justify-center gap-2 transition-colors text-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {procesandoPago ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
                    ) : (
                      <>Aceptar y continuar</>
                    )}
                  </button>
                  
                  <div className="text-center pb-2">
                    <span onClick={() => setPaypalStep(1)} className="text-[#0070ba] text-sm font-semibold hover:underline cursor-pointer">
                      Volver a la selección de cuenta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
