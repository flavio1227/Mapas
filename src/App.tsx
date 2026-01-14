import { Mountain, AlertTriangle, Pickaxe, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

type MapType = 'concesiones' | 'incidencias' | 'permisos';

interface TableConfig {
  title: string;
  url: string;
  type: 'iframe' | 'html';
}

interface MapConfig {
  id: MapType;
  title: string;
  description: string;
  icon: JSX.Element;
  url: string;
  tables: TableConfig[];
}

function App() {
  const [activeMap, setActiveMap] = useState<MapType>('concesiones');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableId: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableId]: !prev[tableId]
    }));
  };

  const maps: MapConfig[] = [
    {
      id: 'concesiones',
      title: 'Concesiones Mineras',
      description: 'Visualización de áreas otorgadas en concesión para la exploración y explotación de recursos minerales en el territorio.',
      icon: <Mountain size={20} />,
      url: 'https://qgiscloud.com/kcastillo/Mapa_Gestion_de_Derechos_Mineros1/?l=DERECHOS%20MINEROS%20OTORGADOS%20EXPLORAR%2CDERECHOS%20MINEROS%20OTORGADOS%20EXPLOTAR%2CPEQUE%C3%91A%20MINER%C3%8DA%20MET%C3%81LICA%20OTORGADA%20EXPLOTAR%2CZonas%20de%20reserva%20Minera%2CGeologico%5B65%5D%2CDEPARTAMENTOS%2COSM%20Standard!&t=Mapa_Gestion_de_Derechos_Mineros1&e=229880%2C1458199%2C952721%2C1796337',
      tables: [
        {
          title: 'Tabla de Concesiones Mineras',
          url: 'about:blank',
          type: 'iframe'
        }
      ]
    },
    {
      id: 'incidencias',
      title: 'Incidencias Mineralógicas',
      description: 'Registro georreferenciado de eventos, hallazgos y anomalías mineralógicas detectadas en el área de estudio.',
      icon: <AlertTriangle size={20} />,
      url: 'https://qgiscloud.com/kcastillo/Mapa_Gestion_de_Derechos_Mineros1/?l=DERECHOS%20MINEROS%20OTORGADOS%20EXPLORAR%2CDERECHOS%20MINEROS%20OTORGADOS%20EXPLOTAR%2CPEQUE%C3%91A%20MINER%C3%8DA%20MET%C3%81LICA%20OTORGADA%20EXPLOTAR%2CZonas%20de%20reserva%20Minera%2CGeologico%5B65%5D%2CDEPARTAMENTOS%2COSM%20Standard!&t=Mapa_Gestion_de_Derechos_Mineros1&e=229880%2C1458199%2C952721%2C1796337',
      tables: [
        {
          title: 'Tabla de Incidencias Mineras',
          url: 'about:blank',
          type: 'iframe'
        }
      ]
    },
    {
      id: 'permisos',
      title: 'Permisos de Minería Artesanal y Pequeña Minería',
      description: 'Mapa de autorizaciones y permisos otorgados para actividades de minería artesanal y pequeña minería.',
      icon: <Pickaxe size={20} />,
      url: 'https://qgiscloud.com/kcastillo/Mapa_Gestion_de_Derechos_Mineros1/?l=DERECHOS%20MINEROS%20OTORGADOS%20EXPLORAR%2CDERECHOS%20MINEROS%20OTORGADOS%20EXPLOTAR%2CPEQUE%C3%91A%20MINER%C3%8DA%20MET%C3%81LICA%20OTORGADA%20EXPLOTAR%2CZonas%20de%20reserva%20Minera%2CGeologico%5B65%5D%2CDEPARTAMENTOS%2COSM%20Standard!&t=Mapa_Gestion_de_Derechos_Mineros1&e=229880%2C1458199%2C952721%2C1796337',
      tables: [
        {
          title: 'Tabla de Permisos de Minería Artesanal y Pequeña Minería',
          url: 'about:blank',
          type: 'iframe'
        }
      ]
    }
  ];
  const currentMap = maps.find(m => m.id === activeMap)!;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E9ECE5' }}>
      {/* Fixed Apple-style Navigation Button */}
      <a
        href="https://flavio1227.github.io/SIGEM1.1/"
        className="fixed top-4 left-4 z-50 inline-block px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
      >
        SIGEM
      </a>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Title and Description */}
          <div className="px-8 py-6" style={{
            borderBottom: '1px solid rgba(30, 77, 43, 0.1)',
            background: 'linear-gradient(to right, #F5F7F3, #FFFFFF)'
          }}>
            <h1 className="text-3xl font-bold mb-3" style={{ color: '#1E4D2B' }}>
              Biblioteca Digital
            </h1>
            <p className="leading-relaxed" style={{ color: '#2F2F2F' }}>
              Visualización interactiva de información geográfica generada en QGIS.
              Este visor permite explorar capas, ubicaciones y datos territoriales.
            </p>
          </div>

          {/* Map Tabs */}
          <div className="px-6 pt-6 bg-white">
            <div className="flex gap-2" style={{ borderBottom: '1px solid rgba(30, 77, 43, 0.15)' }}>
              {maps.map((map) => (
                <button
                  key={map.id}
                  onClick={() => setActiveMap(map.id)}
                  className="flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 border-b-2 -mb-px"
                  style={activeMap === map.id ? {
                    borderColor: '#1E4D2B',
                    color: '#1E4D2B',
                    backgroundColor: '#F5F7F3'
                  } : {
                    borderColor: 'transparent',
                    color: '#2F2F2F'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMap !== map.id) {
                      e.currentTarget.style.backgroundColor = '#F5F7F3';
                      e.currentTarget.style.color = '#1E4D2B';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMap !== map.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#2F2F2F';
                    }
                  }}
                >
                  {map.icon}
                  <span className="hidden sm:inline">{map.title}</span>
                  <span className="sm:hidden">{map.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Map Info */}
          <div className="px-8 py-4 bg-white" style={{ borderBottom: '1px solid rgba(30, 77, 43, 0.1)' }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#1E4D2B' }}>
              {currentMap.title}
            </h2>
            <p className="text-sm" style={{ color: '#2F2F2F' }}>
              {currentMap.description}
            </p>
          </div>

          {/* Map Container */}
          <div className="p-6" style={{ backgroundColor: '#F5F7F3' }}>
            <div className="relative w-full rounded-lg overflow-hidden shadow-md bg-white" style={{ height: 'calc(100vh - 420px)', minHeight: '500px' }}>
              <iframe
                key={activeMap}
                src={currentMap.url}
                title={currentMap.title}
                className="w-full h-full border-0"
                allowFullScreen
                allow="geolocation; microphone; camera; fullscreen"
                loading="lazy"
              />

              {/* Placeholder Overlay - Only show if URL is about:blank */}
              {currentMap.url === 'about:blank' && (
                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed" style={{
                  backgroundColor: '#F5F7F3',
                  borderColor: 'rgba(30, 77, 43, 0.3)'
                }}>
                  <div className="text-center px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                      backgroundColor: 'rgba(30, 77, 43, 0.1)'
                    }}>
                      <svg className="w-8 h-8" style={{ color: '#4C8C4A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E4D2B' }}>
                      {currentMap.title}
                    </h3>
                    <p className="text-sm max-w-md" style={{ color: '#2F2F2F' }}>
                      Configure la URL del mapa QGIS en el array <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(30, 77, 43, 0.1)' }}>maps</code> para el mapa "{currentMap.id}" para visualizar el contenido geoespacial.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Data Tables Section */}
          {currentMap.tables && currentMap.tables.length > 0 && (
            <div className="px-6 pb-6" style={{ backgroundColor: '#F5F7F3' }}>
              <div className="space-y-4">
                {currentMap.tables.map((table, index) => {
                  const tableId = `${activeMap}-table-${index}`;
                  const isExpanded = expandedTables[tableId] !== false;

                  return (
                    <div key={tableId} className="bg-white rounded-lg shadow-md overflow-hidden">
                      {/* Table Header */}
                      <button
                        onClick={() => toggleTable(tableId)}
                        className="w-full px-6 py-4 flex items-center justify-between transition-colors duration-200"
                        style={{
                          borderBottom: isExpanded ? '1px solid rgba(30, 77, 43, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F7F3'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <h3 className="text-base font-semibold text-left" style={{ color: '#1E4D2B' }}>
                          {table.title}
                        </h3>
                        {isExpanded ? (
                          <ChevronUp size={20} style={{ color: '#4C8C4A' }} />
                        ) : (
                          <ChevronDown size={20} style={{ color: '#4C8C4A' }} />
                        )}
                      </button>

                      {/* Table Content */}
                      {isExpanded && (
                        <div className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
                          <div className="relative w-full rounded overflow-hidden" style={{
                            height: '400px',
                            border: '1px solid rgba(30, 77, 43, 0.1)'
                          }}>
                            {table.type === 'iframe' ? (
                              <>
                                <iframe
                                  src={table.url}
                                  title={table.title}
                                  className="w-full h-full border-0"
                                  allow="geolocation; microphone; camera; fullscreen"
                                  loading="lazy"
                                />
                                {/* Placeholder for empty iframe */}
                                {table.url === 'about:blank' && (
                                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#F5F7F3' }}>
                                    <div className="text-center px-6">
                                      <p className="text-sm" style={{ color: '#2F2F2F' }}>
                                        Configure la URL de la tabla en el array <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(30, 77, 43, 0.1)' }}>tables</code> para el mapa "{activeMap}"
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full overflow-auto p-4" style={{ backgroundColor: '#FFFFFF' }}>
                                <p className="text-sm" style={{ color: '#2F2F2F' }}>
                                  Espacio reservado para tabla HTML embebida
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="px-8 py-4" style={{
            backgroundColor: '#F5F7F3',
            borderTop: '1px solid rgba(30, 77, 43, 0.1)'
          }}>
            <p className="text-sm text-center" style={{ color: '#2F2F2F', opacity: 0.7 }}>
              Biblioteca Digital
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
