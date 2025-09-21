import React, { useEffect, useState } from 'react';
import { crearOperacion, actualizarOperacion } from '../api/operacionesService';
import Swal from 'sweetalert2';

const addMonths = (dateStr, months) => {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + Number(months));
    return d;
};

export default function OperacionForm({ initialData, onSaved, onCancel, operaciones }) {
    const [form, setForm] = useState({
        operacionID: 0,
        identificacion: '',
        nombre: '',
        tipoCredito: '',
        monto: '',
        fechaInicio: new Date().toISOString().slice(0, 10),
        plazoMeses: 12,
        aprobado: false
    });
    const [tiposCredito, setTiposCredito] = useState([]); // <-- estado para tipos
    const [errors, setErrors] = useState({});

    // 🚀 Cargar tipos de crédito desde API
    useEffect(() => {
        const loadTipos = async () => {
            try {
                const res = await fetch('http://localhost:5174/api/TipoCredito');
                const data = await res.json();
                setTiposCredito(data);

                // Si no hay tipo seleccionado, usar el primero
                setForm(f => ({
                    ...f,
                    tipoCredito: initialData?.tipoCredito || data[0]?.codigo || ''
                }));
            } catch (err) {
                console.error('Error cargando tipos de crédito', err);
            }
        };
        loadTipos();
    }, [initialData]);


    useEffect(() => {
        if (initialData) {
            setForm({
                operacionID: initialData.operacionID,
                identificacion: initialData.identificacion || '',
                nombre: initialData.nombre || '',
                tipoCredito:
                    initialData?.tipoCredito && tiposCredito.length > 0
                        ? (tiposCredito.find(tc => tc.nombre === initialData.tipoCredito)?.codigo || tiposCredito[0].codigo)
                        : (tiposCredito[0]?.codigo || ''),
                monto: initialData.monto || '',
                fechaInicio: (new Date(initialData.fechaInicio)).toISOString().slice(0, 10),
                plazoMeses: initialData.plazoMeses || 12,
                aprobado: initialData.aprobado || false
            });
        }
    }, [initialData, tiposCredito]);

    const validate = () => {
        const e = {};
        if (!form.identificacion) e.identificacion = 'Requerido';
        if (!form.nombre) e.nombre = 'Requerido';
        if (!form.monto || isNaN(Number(form.monto))) e.monto = 'Monto numérico';
        if (!form.fechaInicio) e.fechaInicio = 'Requerido';
        if (!form.plazoMeses || isNaN(Number(form.plazoMeses))) e.plazoMeses = 'Plazo numérico';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        // Validar duplicados en frontend
        const isDuplicate = operaciones.some(
            o => o.identificacion === form.identificacion && o.operacionID !== form.operacionID
        );
        if (isDuplicate) {
            Swal.fire('Duplicado', 'Ya existe una operación con esa identificación.', 'error');
            return;
        }
        // Armar payload solo con las propiedades necesarias
        const payload = {
            operacionID: form.operacionID,
            identificacion: form.identificacion,
            nombre: form.nombre,
            tipoCredito: form.tipoCredito,
            monto: Number(form.monto),
            fechaInicio: new Date(form.fechaInicio).toISOString(),
            plazoMeses: Number(form.plazoMeses),
            aprobado: form.aprobado
        };
        console.log('Payload a enviar:', payload); // Para verificar en consola
        try {
            if (form.operacionID && form.operacionID > 0) {
                await actualizarOperacion(form.operacionID, payload);
                Swal.fire('Actualizado', 'La operación ha sido actualizada.', 'success');
            } else {
                await crearOperacion(payload);
                Swal.fire('Guardado', 'La operación ha sido guardada.', 'success');
            }
            onSaved && onSaved();
        } catch (error) {
            console.error('Error al guardar operación:', error);
            Swal.fire('Error', 'Ocurrió un error al guardar la operación', 'error');
        }
    };

    const fechaFin = addMonths(form.fechaInicio, form.plazoMeses);

    // Estilos comunes
    const inputStyle = {
        padding: '6px 10px',
        borderRadius: 5,
        border: '1px solid #ccc',
        width: '100%',
        marginTop: 4,
        marginBottom: 6,
        fontSize: 14
    };

    const labelStyle = { marginTop: 8, display: 'block', fontWeight: 'bold' };
    const errorStyle = { color: 'red', fontSize: 12, marginBottom: 4 };
    const buttonStyle = {
        padding: '8px 14px',
        borderRadius: 5,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginRight: 8
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: 20, marginTop: 10, borderRadius: 6 }}>
            <h3>{form.operacionID ? 'Editar' : 'Nueva'} Operación</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label style={labelStyle}>Identificación</label>
                    <input style={inputStyle} value={form.identificacion} onChange={e => setForm({ ...form, identificacion: e.target.value })} />
                    <div style={errorStyle}>{errors.identificacion}</div>
                </div>

                <div>
                    <label style={labelStyle}>Nombre</label>
                    <input style={inputStyle} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                    <div style={errorStyle}>{errors.nombre}</div>
                </div>

                <div>
                    <label style={labelStyle}>Tipo Crédito</label>
                    <select
                        value={form.tipoCredito}
                        onChange={e => setForm({ ...form, tipoCredito: e.target.value })}
                        style={inputStyle}
                    >
                        {tiposCredito.map(tc => (
                            <option key={tc.codigo} value={tc.codigo}>
                                {tc.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Monto</label>
                    <input style={inputStyle} type="number" step="0.01" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} />
                    <div style={errorStyle}>{errors.monto}</div>
                </div>

                <div>
                    <label style={labelStyle}>Fecha Inicio</label>
                    <input style={inputStyle} type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} />
                    <div style={errorStyle}>{errors.fechaInicio}</div>
                </div>

                <div>
                    <label style={labelStyle}>Plazo (meses)</label>
                    <input style={inputStyle} type="number" value={form.plazoMeses} onChange={e => setForm({ ...form, plazoMeses: e.target.value })} />
                    <div style={errorStyle}>{errors.plazoMeses}</div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <label style={{ fontWeight: 'bold', marginRight: 8 }}>Aprobado</label>
                    <input type="checkbox" checked={form.aprobado} onChange={e => setForm({ ...form, aprobado: e.target.checked })} />
                </div>

                <div style={{ marginTop: 10 }}>
                    <label style={{ fontWeight: 'bold' }}>Fecha Fin (calculada): </label>
                    <strong>{fechaFin.toLocaleDateString()}</strong>
                </div>

                <div style={{ marginTop: 15 }}>
                    <button type="submit" style={{ ...buttonStyle, backgroundColor: '#4CAF50', color: 'white' }}>Guardar</button>
                    <button
                        type="button"
                        onClick={async () => {
                            const result = await Swal.fire({
                                title: '¿Cancelar?',
                                text: "Se perderán los cambios no guardados",
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonColor: '#f44336',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Sí, cancelar',
                                cancelButtonText: 'Seguir editando'
                            });
                            if (result.isConfirmed) onCancel();
                        }}
                        style={{ ...buttonStyle, backgroundColor: '#f44336', color: 'white' }}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
