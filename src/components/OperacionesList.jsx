import React, { useEffect, useState } from 'react';
import { obtenerOperaciones, eliminarOperacion } from '../api/operacionesService';
import OperacionForm from './OperacionForm';
import OperacionChart from './OperacionChart';
import Swal from 'sweetalert2';

export default function OperacionesList() {
    const [operaciones, setOperaciones] = useState([]);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showChartModal, setShowChartModal] = useState(false);

    const load = async (q = '') => {
        const data = await obtenerOperaciones(q);
        setOperaciones(data);
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => { load(search); }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const onDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar operación?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f44336',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await eliminarOperacion(id);
                await load(search);
                Swal.fire('Eliminado!', 'La operación ha sido eliminada.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Ocurrió un error al eliminar la operación', 'error');
            }
        }
    };

    return (
        <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
            <h2>Operaciones</h2>

            {/* Contenedor de búsqueda y botones */}
            <div style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    placeholder="Buscar por nombre o identificación"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #ccc',
                        flex: 1,
                        fontSize: 14
                    }}
                />
                <button
                    onClick={() => { setSearch(''); load(); }}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: '#f44336',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Limpiar
                </button>

                <button
                    onClick={() => { setEditing(null); setShowFormModal(true); }}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Nueva Operación
                </button>

                <button
                    onClick={() => setShowChartModal(true)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Mostrar Gráfica
                </button>
            </div>

            {/* Tabla de operaciones */}
            <table border="1" cellPadding="6" style={{ marginTop: 10, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr>
                        <th>ID</th><th>Identificación</th><th>Nombre</th><th>Tipo Crédito</th><th>Valor Inicial</th>
                        <th>Inicio Préstamo</th><th>Plazo Meses</th><th>Fecha Fin</th><th>Aprobado</th><th>Fecha Registro</th><th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {operaciones.map(o => (
                        <tr key={o.operacionID}>
                            <td>{o.operacionID}</td>
                            <td>{o.identificacion}</td>
                            <td>{o.nombre}</td>
                            <td>{o.tipoCredito}</td>
                            <td>{Number(o.monto).toLocaleString()}</td>
                            <td>{new Date(o.fechaInicio).toLocaleDateString()}</td>
                            <td>{o.plazoMeses}</td>
                            <td>{new Date(o.fechaFin).toLocaleDateString()}</td>
                            <td>{o.aprobado ? 'SI' : 'NO'}</td>
                            <td>{o.fechaRegistro}</td>
                            <td style={{ display: 'flex', gap: '5px' }}>
                                <button
                                    onClick={() => { setEditing(o); setShowFormModal(true); }}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        border: 'none',
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => onDelete(o.operacionID)}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        border: 'none',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal Form */}
            {showFormModal && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <OperacionForm
                            initialData={editing}
                            operaciones={operaciones}
                            onSaved={() => { setShowFormModal(false); load(search); }}
                            onCancel={() => setShowFormModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Modal Chart */}
            {showChartModal && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: 'white' }}>Gráfico de Operaciones</h3>
                            <button
                                onClick={() => setShowChartModal(false)}
                                style={{ background: 'red', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: 4 }}
                            >
                                X
                            </button>
                        </div>
                        <OperacionChart operaciones={operaciones} />
                    </div>
                </div>
            )}
        </div>
    );
}

// Estilos del modal
const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    content: {
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 8,
        width: '90%',
        maxWidth: 800,
        maxHeight: '90%',
        overflowY: 'auto',
    },
};
