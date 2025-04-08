import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/goals", label: "Goal Setting", icon: "flag" },
    { path: "/mental-health", label: "Mental Health", icon: "sentiment_satisfied_alt" },
    { path: "/social", label: "Social Connections", icon: "people" },
    { path: "/learning", label: "Learning Hub", icon: "school" },
    { path: "/finance", label: "Financial Planning", icon: "account_balance_wallet" },
    { path: "/productivity", label: "Productivity", icon: "schedule" },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-neutral-200 h-full">
      <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200">
        <h1 className="text-xl font-semibold">
          <span className="text-primary-600"></span>
          <span className="text-secondary-600">Navio</span>
          <span className="text-accent-600"></span>
        </h1>
      </div>
      
      <div className="flex flex-col flex-grow p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition duration-200",
              location === item.path 
                ? "bg-primary-600 text-white dark:bg-primary-900 dark:text-white font-bold shadow-md border-l-4 border-accent-500" 
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-l-4 hover:border-l-primary-300"
            )}
          >
            <span className="material-icons mr-3 text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-neutral-200">
        <Link 
          href="/settings" 
          className={cn(
            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition duration-200",
            location === "/settings" 
              ? "bg-primary-600 text-white dark:bg-primary-900 dark:text-white font-bold shadow-md border-l-4 border-accent-500" 
              : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-l-4 hover:border-l-primary-300"
          )}
        >
          <span className="material-icons mr-3 text-lg">settings</span>
          Settings
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
