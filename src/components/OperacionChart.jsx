import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function OperacionChart({ operaciones }) {
  // Agrupar por mes/año de FechaInicio
  const meses = {};
  operaciones.forEach(o => {
    const d = new Date(o.fechaInicio);
    const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
    meses[key] = (meses[key] || 0) + 1;
  });

  const labels = Object.keys(meses).sort();
  const data = {
    labels,
    datasets: [
      { 
        label: '# Operaciones', 
        data: labels.map(l => meses[l]), 
        borderWidth: 1,
        backgroundColor: 'white', // color de las barras
      }
    ]
  };

  const options = {
    plugins: {
      legend: { labels: { color: 'white' } }, // color del texto de la leyenda
      title: { display: true, text: 'Operaciones por mes', color: 'white' } // título blanco
    },
    scales: {
      x: { ticks: { color: 'white' } }, // etiquetas del eje X blancas
      y: { ticks: { color: 'white' } }  // etiquetas del eje Y blancas
    }
  };

  return (
    <div style={{ maxWidth: 700, marginTop: 10 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
