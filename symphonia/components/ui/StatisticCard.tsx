import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
export default function StatisticCard(){
const data = [
  { mois: 'Jan', frequence: 45 },
  { mois: 'Fév', frequence: 52 },
  { mois: 'Mar', frequence: 10 },
  { mois: 'Avr', frequence: 65 },
  { mois: 'Mai', frequence: 48 },
  { mois: 'Juin', frequence: 20 },
  { mois: 'Juil', frequence: 55 },
  { mois: 'Août', frequence: 60 },
  { mois: 'Sep', frequence: 50 },
    { mois: 'Oct', frequence: 35 },
    { mois: 'Nov', frequence: 58 },
    { mois: 'Déc', frequence: 72 },
];
    return(
        <LineChart
      style={{ width: '100%', maxWidth: '700px', height: '100%',
         maxHeight: '60vh', aspectRatio: 1.618,
         backgroundColor: 'var(--color-surface-raised)', 
         borderRadius: '0.5rem', padding: '1rem' ,
         borderColor:'#d0d0d0d',
         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.5)'
        }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false}/>
      <XAxis dataKey="mois" stroke="var(--color-text-4)"    tick={{ fontSize: 14 }}/>
      <YAxis width="auto" stroke="var(--color-text-3)" />
      <Tooltip
        cursor={{
          stroke: 'var(--color-border-3)',
        }}

        contentStyle={{
          backgroundColor: 'var(--color-surface-raised)',
          borderColor: 'var(--color-border-2)',
          fontSize:14
        }}
      />
      <Legend  wrapperStyle={{fontSize:14}}/>
      <Line
        type="monotone"
        dataKey="frequence"
        stroke="var(--color-button)"
        dot={{
          fill: '#fff',
        }}
        activeDot={{ r: 8, stroke: 'var(--color-surface-base)' }}
      />
      <Line
        type="monotone"
        dataKey="mois"
        
        stroke="#3b82f6"
        dot={{
          fill: '#fff',
        }}
        activeDot={{ stroke: 'var(--color-surface-base)' }}
      />

<RechartsDevtools />
    </LineChart>
  );

    
}