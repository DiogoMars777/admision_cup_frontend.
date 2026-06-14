import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CargaMasivaPage() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
    // Reiniciar el valor del input para permitir seleccionar el mismo archivo consecutivamente
    e.target.value = null;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo primero');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const endpoint = 'http://localhost:8000/api/carga-masiva/notas';
        
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success(response.data.message || 'Carga exitosa');
      setResult({
        success: true,
        message: response.data.message,
        details: response.data.details || []
      });
      setFile(null);
    } catch (error) {
      toast.error('Error al procesar el archivo');
      setResult({
        success: false,
        message: error.response?.data?.message || 'Error desconocido',
        details: error.response?.data?.details || []
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/carga-masiva/plantilla-notas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Importante para manejar archivos
      });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Plantilla_Notas.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      toast.error('Error al descargar la plantilla');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <UploadCloud className="w-8 h-8 text-blue-600" />
          Carga Masiva de Notas
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Sube un archivo Excel para registrar las calificaciones de múltiples postulantes a la vez en el sistema.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">1. Descargar Plantilla</h3>
            <p className="text-gray-500 text-sm mt-1">Utiliza esta plantilla para asegurar el formato correcto de las notas.</p>
          </div>
          <button 
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-colors border border-emerald-100 hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isDownloading ? 'Descargando...' : 'Descargar Excel'}
          </button>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">2. Subir Archivo Completado</h3>
          
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-blue-500 transition-colors bg-gray-50">
            <div className="space-y-1 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-2 py-1"
                >
                  <span>Sube un archivo</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                </label>
                <p className="pl-1 py-1">o arrastra y suelta aquí</p>
              </div>
              <p className="text-xs text-gray-500">
                Solo archivos .xlsx, .xls o .csv
              </p>
            </div>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-900 text-sm">{file.name}</p>
                  <p className="text-xs text-blue-600">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700 text-sm font-bold"
              >
                Quitar
              </button>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading || isDownloading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-sm transition-all ${
                (!file || isUploading || isDownloading)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Iniciar Carga Masiva
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className={`p-6 rounded-2xl border ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-4">
            {result.success ? (
              <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
            )}
            <div>
              <h3 className={`text-lg font-bold ${result.success ? 'text-emerald-900' : 'text-red-900'}`}>
                {result.message}
              </h3>
              
              {result.details && result.details.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {result.details.map((detail, idx) => (
                    <li key={idx} className={`text-sm ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                      • {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
