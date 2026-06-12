import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FileText, Printer, Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PublicPostulacionModal({ isOpen, onClose }) {
  const currentYear = new Date().getFullYear();
  const formRef = useRef(null);
  
  const departamentos = ['Santa Cruz', 'Beni', 'Pando', 'La Paz', 'Cochabamba', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija'];
  
  const [carrerasDb, setCarrerasDb] = useState([]);
  const [activeCupName, setActiveCupName] = useState(`CUP ${currentYear}`);
  const [showCarreraModal, setShowCarreraModal] = useState(false);
  const [activeCareerIndex, setActiveCareerIndex] = useState(1);
  const [form, setForm] = useState({
    apellidos: '', nombre: '', ci: '', procedencia: '', genero: '', telf1: '', telf2: '', correo: '',
    ue: '', tipoUe: '', turnoUe: '', provinciaUe: '', anioEgreso: '',
    turnoPreferido: '', modalidadPreferida: '',
    carrera1: '', modalidad1: '', carrera2: '', modalidad2: ''
  });

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:8000/api/public/carreras')
        .then(res => setCarrerasDb(res.data))
        .catch(err => console.error("Error fetching carreras:", err));
        
      axios.get('http://localhost:8000/api/public/gestion-activa')
        .then(res => setActiveCupName(res.data.cup))
        .catch(err => console.error("Error fetching gestion activa:", err));
    } else {
      setForm({
        apellidos: '', nombre: '', ci: '', procedencia: '', genero: '', telf1: '', telf2: '', correo: '',
        ue: '', tipoUe: '', turnoUe: '', provinciaUe: '', anioEgreso: '',
        turnoPreferido: '', modalidadPreferida: '',
        carrera1: '', modalidad1: '', carrera2: '', modalidad2: ''
      });
      setShowCarreraModal(false);
    }
  }, [isOpen]);

  const handleDownloadPdf = async () => {
    try {
      const element = formRef.current;
      if (!element) throw new Error("No se pudo encontrar el formulario.");

      // Resolver problema de importación en Vite para html2canvas
      const h2c = typeof html2canvas === 'function' ? html2canvas : (html2canvas.default || window.html2canvas);
      if (!h2c) throw new Error("Librería de renderizado no disponible.");

      const printContents = formRef.current.innerHTML;
      
      // Crear iframe oculto para limpiar los estilos de Tailwind (que usan oklch y rompen html2canvas)
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '1200px';
      document.body.appendChild(iframe);
      
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(`
        <html>
          <head>
            <style>
              body { font-family: 'Times New Roman', Times, serif; color: black; padding: 40px; background: white; margin: 0; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .mb-1 { margin-bottom: 0.25rem; }
              .mb-3 { margin-bottom: 0.75rem; }
              .mb-4 { margin-bottom: 1rem; }
              .mb-8 { margin-bottom: 2rem; }
              .mt-4 { margin-top: 1rem; }
              .mt-10 { margin-top: 2.5rem; }
              .pb-1 { padding-bottom: 0.25rem; }
              .p-1\\.5 { padding: 0.375rem; }
              .w-full { width: 100%; box-sizing: border-box; }
              .w-20 { width: 5rem; }
              .w-32 { width: 8rem; }
              .w-40 { width: 10rem; }
              .w-64 { width: 16rem; }
              .flex { display: flex; }
              .flex-1 { flex: 1 1 0%; }
              .items-center { align-items: center; }
              .items-end { align-items: flex-end; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
              .gap-4 { gap: 1rem; }
              .gap-x-6 { column-gap: 1.5rem; }
              .gap-x-8 { column-gap: 2rem; }
              .gap-y-4 { row-gap: 1rem; }
              .border { border-width: 1px; border-style: solid; }
              .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
              .border-gray-300 { border-color: #d1d5db; }
              .border-gray-400 { border-color: #9ca3af; }
              .bg-gray-50 { background-color: #f9fafb; }
              .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
              .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
              .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
              .text-2xl { font-size: 1.5rem; line-height: 2rem; }
              .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
              .tracking-tight { letter-spacing: -0.025em; }
              .uppercase { text-transform: uppercase; }
              button { display: none !important; }
              input, select { display: block; box-sizing: border-box; background: white; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      iframe.contentWindow.document.close();

      // Esperar a que el navegador renderice el iframe
      await new Promise(resolve => setTimeout(resolve, 300));

      // Reemplazar inputs y selects por DIVs estáticos para que html2canvas no corte el texto
      const originalInputs = formRef.current.querySelectorAll('input, select');
      const copiedInputs = iframe.contentWindow.document.querySelectorAll('input, select');
      originalInputs.forEach((el, index) => {
          const target = copiedInputs[index];
          if(target) {
              const val = el.value;
              const div = iframe.contentWindow.document.createElement('div');
              div.className = target.className;
              div.style.cssText = target.style.cssText;
              // Ajustes para que el div se vea igual al input
              div.style.display = 'flex';
              div.style.alignItems = 'center';
              const isCenter = target.classList.contains('text-center') || target.style.textAlignLast === 'center';
              div.style.justifyContent = isCenter ? 'center' : 'flex-start';
              div.style.minHeight = '30px';
              div.style.boxSizing = 'border-box';
              div.style.padding = '6px'; // p-1.5
              div.style.overflow = 'hidden';
              div.innerText = val || '';
              // Mantener colores consistentes
              if (!val) {
                 div.style.color = '#9ca3af'; // color de placeholder
                 div.innerText = el.options && el.options[0]?.disabled ? el.options[0].text : el.placeholder || '';
              } else {
                 div.style.color = 'black';
              }
              target.parentNode.replaceChild(div, target);
          }
      });

      const canvas = await h2c(iframe.contentWindow.document.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Usar 'mm' es mucho más seguro y compatible con jsPDF en A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`postulacion_cup_${form.ci || 'nuevo'}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error: " + (error.message || error));
    }
  };

  const handlePrint = () => {
    const printContents = formRef.current.innerHTML;
    
    // Crear iframe oculto para impresión
    const iframe = document.createElement('iframe');
    iframe.style.visibility = 'hidden';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);
    
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(`
      <html>
        <head>
          <title>Formulario de Postulación</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; color: black; padding: 20px; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-10 { margin-top: 2.5rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .p-1\\.5 { padding: 0.375rem; }
            .w-full { width: 100%; box-sizing: border-box; }
            .w-20 { width: 5rem; }
            .w-32 { width: 8rem; }
            .w-40 { width: 10rem; }
            .w-64 { width: 16rem; }
            .flex { display: flex; }
            .flex-1 { flex: 1 1 0%; }
            .items-center { align-items: center; }
            .items-end { align-items: flex-end; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .gap-x-6 { column-gap: 1.5rem; }
            .gap-x-8 { column-gap: 2rem; }
            .gap-y-4 { row-gap: 1rem; }
            .border { border-width: 1px; border-style: solid; }
            .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-400 { border-color: #9ca3af; }
            .bg-gray-50 { background-color: #f9fafb; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .tracking-tight { letter-spacing: -0.025em; }
            .uppercase { text-transform: uppercase; }
            button { display: none !important; }
            input, select { display: block; box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    iframe.contentWindow.document.close();
    
    // Copiar valores de los inputs al iframe
    const originalInputs = formRef.current.querySelectorAll('input, select');
    const copiedInputs = iframe.contentWindow.document.querySelectorAll('input, select');
    originalInputs.forEach((el, index) => {
        if(copiedInputs[index]) copiedInputs[index].value = el.value;
    });

    // Ejecutar impresión desde el iframe
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Eliminar el iframe después de imprimir
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 flex flex-col relative">
        
        {/* Header Acciones Fijas (Fuera del PDF) */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Formulario de Postulación
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Zona del Formulario a Imprimir */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          <div ref={formRef} className="bg-white p-6 max-w-3xl mx-auto" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            
            {/* Encabezado Institucional */}
            <div className="mb-8 text-black">
              <h1 className="text-3xl font-bold tracking-tight mb-1">UAGRM</h1>
              <h2 className="text-2xl font-bold tracking-tight mb-1">{activeCupName}</h2>
              <h3 className="text-lg font-bold tracking-tight uppercase">FACULTAD DE INGENIERIA EN CIENCIAS DE LA COMPUTACIÓN Y TELECOMUNICACIONES</h3>
            </div>

            {/* SECCIÓN 1 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-3">Datos Personales</h3>
              <p className="text-sm text-gray-800 mb-4 font-semibold">PASO 1.- Ingrese sus datos personales.</p>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">Apellido(s)</label>
                  <input type="text" placeholder="Ej. Pérez Gómez" className={`w-full border border-gray-400 p-1.5 text-sm text-center placeholder-gray-400 ${form.apellidos ? 'text-black font-bold' : ''}`} value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} />
                </div>
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">Nombre(s)</label>
                  <input type="text" placeholder="Ej. Juan Carlos" className={`w-full border border-gray-400 p-1.5 text-sm text-center placeholder-gray-400 ${form.nombre ? 'text-black font-bold' : ''}`} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-x-6 gap-y-4 mt-4">
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">Cédula de Identidad</label>
                  <input type="text" placeholder="Ej. 1234567" className={`w-full border border-gray-400 p-1.5 text-sm text-center placeholder-gray-400 ${form.ci ? 'text-black font-bold' : ''}`} value={form.ci} onChange={e => setForm({...form, ci: e.target.value})} />
                </div>
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">Procedencia</label>
                  <select className={`w-full border border-gray-400 p-1.5 text-sm text-center bg-white appearance-none ${form.procedencia === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.procedencia} onChange={e => setForm({...form, procedencia: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. Santa Cruz</option>
                    {departamentos.map(d => <option key={d} value={d} className="text-black font-bold">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">Género</label>
                  <select className={`w-full border border-gray-400 p-1.5 text-sm bg-white text-center ${form.genero === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.genero} onChange={e => setForm({...form, genero: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. Masculino</option>
                    <option value="Masculino" className="text-black font-bold">Masculino</option>
                    <option value="Femenino" className="text-black font-bold">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-x-6 gap-y-4 mt-4">
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">1er Telf. de Contacto</label>
                  <input type="text" placeholder="Ej. 70012345" className={`w-full border border-gray-400 p-1.5 text-sm text-center placeholder-gray-400 ${form.telf1 ? 'text-black font-bold' : ''}`} value={form.telf1} onChange={e => setForm({...form, telf1: e.target.value})} />
                </div>
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">2do Telf. de Contacto (opcional)</label>
                  <input type="text" placeholder="Ej. 3331234" className={`w-full border border-gray-400 p-1.5 text-sm text-center placeholder-gray-400 ${form.telf2 ? 'text-black font-bold' : ''}`} value={form.telf2} onChange={e => setForm({...form, telf2: e.target.value})} />
                </div>
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">Correo Electrónico</label>
                  <input type="email" placeholder="Ej. juan@email.com" className={`w-full border border-gray-400 p-1.5 text-sm text-center placeholder-gray-400 ${form.correo ? 'text-black font-bold' : ''}`} value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2 */}
            <div className="mb-8 mt-10">
              <h3 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-3">Datos de la Unidad Educativa</h3>
              <p className="text-sm text-gray-800 mb-4 font-semibold">PASO 2.- Ingrese los datos de la unidad educativa de la cual egresó.</p>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-center text-sm font-bold text-black mb-1">Unidad Educativa</label>
                  <input type="text" placeholder="Ej. Nacional Florida" className={`w-full border border-gray-400 p-1.5 text-sm text-center placeholder-gray-400 ${form.ue ? 'text-black font-bold' : ''}`} value={form.ue} onChange={e => setForm({...form, ue: e.target.value})} />
                </div>
                <div className="w-32">
                  <label className="block text-center text-sm font-bold text-black mb-1">Tipo</label>
                  <select className={`w-full border border-gray-400 p-1.5 text-sm bg-white text-center ${form.tipoUe === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.tipoUe} onChange={e => setForm({...form, tipoUe: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. Fiscal</option>
                    <option value="Fiscal" className="text-black font-bold">Fiscal</option>
                    <option value="Convenio" className="text-black font-bold">Convenio</option>
                    <option value="Particular" className="text-black font-bold">Particular</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-center text-sm font-bold text-black mb-1">Turno</label>
                  <select className={`w-full border border-gray-400 p-1.5 text-sm bg-white text-center ${form.turnoUe === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.turnoUe} onChange={e => setForm({...form, turnoUe: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. Mañana</option>
                    <option value="Mañana" className="text-black font-bold">Mañana</option>
                    <option value="Tarde" className="text-black font-bold">Tarde</option>
                    <option value="Noche" className="text-black font-bold">Noche</option>
                  </select>
                </div>
                <div className="w-40">
                  <label className="block text-center text-sm font-bold text-black mb-1">Provincia</label>
                  <input type="text" placeholder="Ej. Andrés Ibáñez" className={`w-full border border-gray-400 p-1.5 text-sm text-center placeholder-gray-400 ${form.provinciaUe ? 'text-black font-bold' : ''}`} value={form.provinciaUe} onChange={e => setForm({...form, provinciaUe: e.target.value})} />
                </div>
                <div className="w-32">
                  <label className="block text-center text-sm font-bold text-black mb-1">Año de Egreso</label>
                  <select className={`w-full border border-gray-400 p-1.5 text-sm bg-white text-center ${form.anioEgreso === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.anioEgreso} onChange={e => setForm({...form, anioEgreso: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. 2026</option>
                    {[...Array(20)].map((_, i) => <option key={i} value={currentYear - i} className="text-black font-bold">{currentYear - i}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN PREFERENCIAS GENERALES */}
            <div className="mb-8 mt-10">
              <h3 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-3">Preferencias Generales</h3>
              <p className="text-sm text-gray-800 mb-4 font-semibold">PASO 3.- Seleccione su preferencia de turno y modalidad para su formación académica.</p>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">Turno Preferido</label>
                  <select className={`w-full border border-gray-400 p-1.5 text-sm bg-white text-center ${form.turnoPreferido === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.turnoPreferido} onChange={e => setForm({...form, turnoPreferido: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. Mañana</option>
                    <option value="Mañana" className="text-black font-bold">Mañana</option>
                    <option value="Tarde" className="text-black font-bold">Tarde</option>
                    <option value="Noche" className="text-black font-bold">Noche</option>
                  </select>
                </div>
                <div>
                  <label className="block text-center text-sm font-bold text-black mb-1">Modalidad Preferida</label>
                  <select className={`w-full border border-gray-400 p-1.5 text-sm bg-white text-center ${form.modalidadPreferida === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.modalidadPreferida} onChange={e => setForm({...form, modalidadPreferida: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. Presencial</option>
                    <option value="Presencial" className="text-black font-bold">Presencial</option>
                    <option value="Virtual" className="text-black font-bold">Virtual</option>
                    <option value="Semi-Presencial" className="text-black font-bold">Semi-Presencial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN CARRERAS */}
            <div className="mb-4 mt-10">
              <h3 className="text-xl font-bold text-black border-b border-gray-300 pb-1 mb-3">Carreras a Postular</h3>
              <p className="text-sm text-gray-800 mb-4 font-semibold">PASO 4.- Haga click en la opción <b>Elegir Carrera</b> para seleccionar a qué carrera desea postular.</p>
              
              <div className="flex gap-4 items-center mb-4">
                <button type="button" onClick={() => { setActiveCareerIndex(1); setShowCarreraModal(true); }} className="bg-gray-200 border border-gray-400 px-4 py-1 text-sm font-semibold hover:bg-gray-300">
                  Elegir
                </button>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-black mb-1">Carrera</label>
                  <input type="text" readOnly placeholder="Ej. Ingeniería de Sistemas" className={`w-full border border-gray-400 p-1.5 text-sm bg-gray-50 placeholder-gray-400 ${form.carrera1 ? 'text-black font-bold' : ''}`} value={form.carrera1} />
                </div>
                <div className="w-64">
                  <label className="block text-sm font-bold text-black mb-1">Modalidad</label>
                  <select className={`w-full border border-gray-400 p-1.5 text-sm bg-white text-center ${form.modalidad1 === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.modalidad1} onChange={e => setForm({...form, modalidad1: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. Presencial</option>
                    <option value="Presencial" className="text-black font-bold">Presencial</option>
                    <option value="Virtual" className="text-black font-bold">Virtual</option>
                  </select>
                </div>
                <div className="w-20 text-center">
                  <label className="block text-sm font-bold text-black mb-1">Opción</label>
                  <p className="text-sm mt-2">1</p>
                </div>
              </div>

              {/* Opción 2 */}
              <div className="flex gap-4 items-center mb-2">
                <button type="button" onClick={() => { setActiveCareerIndex(2); setShowCarreraModal(true); }} className="bg-gray-200 border border-gray-400 px-4 py-1 text-sm font-semibold hover:bg-gray-300">
                  Elegir
                </button>
                <div className="flex-1">
                  <input type="text" readOnly placeholder="Ej. Ingeniería Informática" className={`w-full border border-gray-400 p-1.5 text-sm bg-gray-50 placeholder-gray-400 ${form.carrera2 ? 'text-black font-bold' : ''}`} value={form.carrera2} />
                </div>
                <div className="w-64">
                  <select className={`w-full border border-gray-400 p-1.5 text-sm bg-white text-center ${form.modalidad2 === '' ? 'text-gray-400 font-normal' : 'text-black font-bold'}`} style={{ textAlignLast: 'center' }} value={form.modalidad2} onChange={e => setForm({...form, modalidad2: e.target.value})}>
                    <option value="" disabled hidden className="text-gray-400 font-normal">Ej. Virtual</option>
                    <option value="Presencial" className="text-black font-bold">Presencial</option>
                    <option value="Virtual" className="text-black font-bold">Virtual</option>
                  </select>
                </div>
                <div className="w-20 text-center">
                  <p className="text-sm mt-2">2</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Botones de Acción Globales */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end space-x-3 sticky bottom-0 z-10">
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-md shadow-sm">
            Cancelar
          </button>
          <button onClick={handlePrint} className="px-5 py-2 flex items-center text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-md shadow-sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </button>
          <button onClick={handleDownloadPdf} className="px-5 py-2 flex items-center text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </button>
        </div>

      </div>

      {/* Mini-Modal para elegir carrera */}
      {showCarreraModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Seleccionar Carrera</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {carrerasDb.map(c => (
                <button 
                  key={c.id} 
                  className="w-full text-left p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => {
                    if (activeCareerIndex === 1) {
                      if (form.carrera2 === c.nombre) {
                        toast.error("No puede elegir la misma carrera dos veces. Seleccione otra.");
                        return;
                      }
                      setForm({...form, carrera1: c.nombre});
                    } else {
                      if (form.carrera1 === c.nombre) {
                        toast.error("No puede elegir la misma carrera dos veces. Seleccione otra.");
                        return;
                      }
                      setForm({...form, carrera2: c.nombre});
                    }
                    setShowCarreraModal(false);
                  }}
                >
                  {c.nombre}
                </button>
              ))}
              {carrerasDb.length === 0 && <p className="text-gray-500 text-sm">Cargando carreras...</p>}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowCarreraModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
