
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HomeIcon, 
  UsersIcon, 
  UserPlusIcon, 
  IdentificationIcon, 
  DocumentTextIcon, 
  UserIcon, 
  CalendarIcon, 
  QuestionMarkCircleIcon, 
  ArrowsPointingInIcon, 
  ChartBarIcon, 
  ChartPieIcon, 
  PresentationChartLineIcon, 
  GlobeAltIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  
  const sections = [
    {
      title: null,
      items: [
        { name: 'Dashboard', path: '/', icon: HomeIcon },
      ]
    },
    {
      title: 'Data',
      items: [
        { name: 'Manage Demo', path: '/manage-demo', icon: UsersIcon },
        { name: 'Build Demo', path: '/build-demo', icon: UserPlusIcon },
        { name: 'Manage Team', path: '/manage-team', icon: IdentificationIcon },
        { name: 'Contacts Information', path: '/contacts', icon: IdentificationIcon },
        { name: 'Invoices Balances', path: '/invoices', icon: DocumentTextIcon },
      ]
    },
    {
      title: 'Pages',
      items: [
        { name: 'Profile Form', path: '/profile', icon: UserIcon },
        { name: 'Task', path: '/task', icon: CalendarIcon },
        { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
        { name: 'FAQ Page', path: '/faq', icon: QuestionMarkCircleIcon },
      ]
    },
    {
      title: 'Design',
      items: [
        { name: 'Compress', path: '/compress', icon: ArrowsPointingInIcon },
      ]
    },
    {
      title: 'Charts',
      items: [
        { name: 'Bar Chart', path: '/bar', icon: ChartBarIcon },
        { name: 'Pie Chart', path: '/pie', icon: ChartPieIcon },
        { name: 'Line Chart', path: '/line', icon: PresentationChartLineIcon },
        { name: 'Geography Chart', path: '/geography', icon: GlobeAltIcon },
      ]
    }
  ];

  return (
    <motion.nav 
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 256,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      className="bg-[#1f2a40]/90 backdrop-blur-xl flex flex-col h-screen fixed top-0 left-0 z-50 overflow-y-auto border-r border-[#3d465d]/50 shadow-2xl overflow-x-hidden"
    >
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ type: "spring", stiffness: 200 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Bars3Icon className="w-6 h-6 text-[#e0e0e0] cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center mb-10 px-6"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4cceac] to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#3d465d] shadow-xl">
                <img 
                  src="https://picsum.photos/seed/avatar/200/200" 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold text-[#e0e0e0] mt-4 tracking-tight whitespace-nowrap"
            >
              thanh
            </motion.h2>
            <motion.p 
              className="text-[#4cceac] text-sm font-semibold uppercase tracking-widest mt-1 whitespace-nowrap"
            >
              Developer
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 px-4 pb-10">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-8">
            {section.title && !isCollapsed && (
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="text-[#a3a3a3] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 px-4 whitespace-nowrap"
              >
                {section.title}
              </motion.h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="relative block"
                    title={isCollapsed ? item.name : ""}
                  >
                    <motion.div
                      whileHover={{ x: isCollapsed ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-2.5 rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? 'text-[#4cceac] bg-[#4cceac]/10 shadow-[0_0_20px_rgba(76,206,172,0.1)]' 
                          : 'text-[#e0e0e0] hover:text-[#4cceac] hover:bg-white/5'
                      }`}
                    >
                      {isActive && !isCollapsed && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute left-0 w-1 h-6 bg-[#4cceac] rounded-r-full"
                        />
                      )}
                      <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium tracking-wide whitespace-nowrap">{item.name}</span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.nav>
  );
};

export default Sidebar;
