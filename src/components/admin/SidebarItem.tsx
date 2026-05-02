interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-all rounded-[1.25rem] ${
      active 
        ? 'bg-[#eb4899] text-white shadow-lg shadow-pink-500/20' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
    <span>{label}</span>
  </button>
);

export default SidebarItem;
