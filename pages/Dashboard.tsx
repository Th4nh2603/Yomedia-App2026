
import React from 'react';
import DataTable from '../components/DataTable';
import { 
  MagnifyingGlassIcon, 
  CloudArrowDownIcon, 
  PrinterIcon, 
  ViewColumnsIcon, 
  FunnelIcon 
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const headers = ['ID', 'YEAR', 'MONTH', 'BRAND', 'HOST', 'VIEW', 'FORMAT', 'FLIGHT'];
  
  const data = Array.from({ length: 15 }, (_, i) => ({
    ID: i + 1,
    YEAR: 2019,
    MONTH: 1,
    BRAND: 'carrier-junior',
    HOST: 'demo',
    VIEW: 'eye',
    FORMAT: i < 3 ? 'firstview' : i < 11 ? 'inpage' : i === 11 ? 'video' : 'inpage',
    FLIGHT: ''
  }));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col">
        <h1 className="text-3xl font-bold text-[#e0e0e0]">DEMO</h1>
        <p className="text-[#4cceac] text-sm">Showing all Demo</p>
      </header>

      <div className="flex justify-end items-center gap-4 mb-2">
        <MagnifyingGlassIcon className="w-5 h-5 text-[#e0e0e0] cursor-pointer" />
        <CloudArrowDownIcon className="w-5 h-5 text-[#e0e0e0] cursor-pointer" />
        <PrinterIcon className="w-5 h-5 text-[#e0e0e0] cursor-pointer" />
        <ViewColumnsIcon className="w-5 h-5 text-[#e0e0e0] cursor-pointer" />
        <FunnelIcon className="w-5 h-5 text-[#e0e0e0] cursor-pointer" />
      </div>

      <div className="bg-[#1f2a40] rounded-lg border border-[#3d465d] overflow-hidden">
        <DataTable headers={headers} data={data} />
      </div>
    </div>
  );
};

export default Dashboard;
