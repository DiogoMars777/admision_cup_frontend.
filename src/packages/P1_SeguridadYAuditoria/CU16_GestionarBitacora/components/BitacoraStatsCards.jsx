import { Activity, Users, ShieldAlert } from 'lucide-react';

export default function BitacoraStatsCards() {
  const stats = [
    { title: 'Total Acciones (Mes)', value: '1,452', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Acciones Hoy', value: '85', icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Usuarios Activos', value: '24', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className={`${stat.bg} ${stat.color} p-4 rounded-lg mr-5`}>
            <stat.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
