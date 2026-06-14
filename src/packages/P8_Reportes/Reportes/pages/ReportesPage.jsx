import { useState, useRef, useEffect } from 'react';
import { Mic, Send, FileText, Download, Loader2, Bot, Trash2 } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportesPage() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const isCoordinador = user?.rol === 'Coordinador';

  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewBlock, setPreviewBlock] = useState(null); // Nuevo estado para previsualización
  const [reportBlocks, setReportBlocks] = useState([]);
  const recognitionRef = useRef(null);
  const reportRef = useRef(null);
  const promptRef = useRef(prompt); // Guardar valor actual para onstart sin re-renderizar

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  const shouldSendRef = useRef(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const newPrompt = final + interimTranscript;
        setPrompt(newPrompt);
        promptRef.current = newPrompt;
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Error de micrófono:', event.error);
        if (event.error !== 'no-speech') {
          toast.error('Error con el micrófono: ' + event.error);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (shouldSendRef.current && promptRef.current.trim() !== '') {
          // Auto enviar al soltar
          shouldSendRef.current = false;
          handleSendRef.current(promptRef.current);
        }
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, []);

  const startListening = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) return toast.error("Tu navegador no soporta reconocimiento de voz.");
    if (isLoading) return;
    shouldSendRef.current = false;
    setPrompt('');
    promptRef.current = '';
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = (e) => {
    e.preventDefault();
    if (isListening) {
      shouldSendRef.current = true;
      recognitionRef.current.stop();
    }
  };

  const handleSendRef = useRef();

  const handleSend = async (textToSend = null) => {
    const text = typeof textToSend === 'string' ? textToSend : prompt;
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/reportes/generar', 
        { prompt: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreviewBlock({ id: Date.now(), prompt: text, data: response.data });
      setPrompt('');
      promptRef.current = '';
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Hubo un error al generar el reporte. ' + (error.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [prompt, previewBlock]);

  const confirmAdd = () => {
    if (previewBlock) {
      setReportBlocks([...reportBlocks, previewBlock]);
      setPreviewBlock(null);
    }
  };

  const discardPreview = () => {
    setPreviewBlock(null);
  };

  const removeBlock = (id) => {
    setReportBlocks(reportBlocks.filter(b => b.id !== id));
  };

  const exportToPdf = (action = 'download') => {
    if (reportBlocks.length === 0) return toast.error('No hay datos para exportar.');
    
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('Reporte Inteligente - Sistema de Admisiones', 14, yPos);
    yPos += 10;

    reportBlocks.forEach((block, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99); // gray-600
      doc.text(`Pregunta: "${block.prompt}"`, 14, yPos);
      yPos += 5;

      const head = [block.data.columns];
      const body = block.data.rows.map(row => block.data.columns.map(col => String(row[col] ?? '-')));

      autoTable(doc, {
        head: head,
        body: body,
        startY: yPos,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 }, // blue-600
        alternateRowStyles: { fillColor: [249, 250, 251] }, // gray-50
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    });

    if (action === 'open') {
      const blob = doc.output('blob');
      window.open(URL.createObjectURL(blob), '_blank');
    } else {
      doc.save('Reporte_Inteligente.pdf');
    }
  };

  const exportToExcel = (format = 'xlsx') => {
    if (reportBlocks.length === 0) return toast.error('No hay datos para exportar.');
    
    if (format === 'csv') {
      const wb = XLSX.utils.book_new();
      let allData = [];
      reportBlocks.forEach((block) => {
        allData.push([`Consulta: ${block.prompt}`]);
        allData.push(block.data.columns);
        allData.push(...block.data.rows.map(row => block.data.columns.map(col => row[col])));
        allData.push([]);
      });
      const ws = XLSX.utils.aoa_to_sheet(allData);
      XLSX.utils.book_append_sheet(wb, ws, "Reporte_CSV");
      XLSX.writeFile(wb, 'Reporte_Inteligente.csv');
      return;
    }

    const wb = XLSX.utils.book_new();
    reportBlocks.forEach((block, index) => {
      if (block.data && block.data.columns && block.data.rows) {
        const wsData = [block.data.columns, ...block.data.rows.map(row => block.data.columns.map(col => row[col]))];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, `Consulta ${index + 1}`);
      }
    });
    
    XLSX.writeFile(wb, 'Reporte_Inteligente.xlsx');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Bot className="w-8 h-8 mr-3 text-blue-600" />
            Reportes Inteligentes (IA)
          </h1>
          <p className="text-gray-500 mt-1">Pídele a Gemini lo que necesitas saber y armaremos el reporte dinámicamente.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex shadow-sm rounded-lg overflow-hidden">
            <button onClick={() => exportToExcel('xlsx')} className="flex items-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors border-r border-green-700 font-medium">
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
            <button onClick={() => exportToExcel('csv')} className="flex items-center px-3 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors font-medium text-sm" title="Descargar como CSV">
              CSV
            </button>
          </div>
          
          <div className="flex shadow-sm rounded-lg overflow-hidden">
            <button onClick={() => exportToPdf('open')} className="flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors border-r border-red-700 font-medium">
              <FileText className="w-4 h-4 mr-2" />
              Ver PDF
            </button>
            <button onClick={() => exportToPdf('download')} className="flex items-center px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors" title="Descargar PDF">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex-shrink-0">
        <div className="flex gap-4">
          <button 
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onMouseLeave={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            className={`relative p-4 rounded-full transition-all duration-300 select-none ${isListening ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
            title="Mantén presionado para hablar"
          >
            {isListening && <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>}
            <Mic className="w-6 h-6 relative z-10" />
          </button>
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Escuchando..." : "Ej: Muéstrame la lista de postulantes registrados hoy..."}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !prompt.trim() || previewBlock !== null}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      {previewBlock && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6 flex-shrink-0 relative shadow-md">
          <div className="flex justify-between items-center mb-4 border-b border-yellow-200 pb-2">
            <div>
              <h3 className="text-yellow-800 font-bold">Vista Previa: "{previewBlock.prompt}"</h3>
              <p className="text-xs text-yellow-600">Revisa los datos antes de añadirlos al reporte final.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={discardPreview} className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium transition-colors">
                Descartar
              </button>
              <button onClick={confirmAdd} className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-bold transition-colors">
                Añadir al Reporte
              </button>
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded border border-yellow-200 p-2 max-h-64">
            {previewBlock.data && previewBlock.data.columns && previewBlock.data.rows && previewBlock.data.rows.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {previewBlock.data.columns.map((col, i) => (
                      <th key={i} className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewBlock.data.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {previewBlock.data.columns.map((col, j) => (
                        <td key={j} className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">{row[col] !== null ? String(row[col]) : '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 p-4">No se encontraron resultados para esta consulta.</p>
            )}
          </div>
        </div>
      )}

      {/* Report Canvas */}
      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-y-auto p-6" ref={reportRef}>
        {reportBlocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <PieChart className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Tu reporte final está vacío.</p>
            <p className="text-sm">Usa el micrófono o escribe una consulta, y luego añádela aquí.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {reportBlocks.map((block) => (
              <div key={block.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative group">
                <div className="bg-blue-50/50 border-b border-gray-200 p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2">Consulta: "{block.prompt}"</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(block.id).toLocaleTimeString()}</p>
                  </div>
                  <button onClick={() => removeBlock(block.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-0 overflow-x-auto">
                  {block.data && block.data.columns && block.data.rows && block.data.rows.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {block.data.columns.map((col, i) => (
                            <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {block.data.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {block.data.columns.map((col, j) => (
                              <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {row[col] !== null ? String(row[col]) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No se encontraron resultados para esta consulta.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Needed imports that were missed at top
import { PieChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
