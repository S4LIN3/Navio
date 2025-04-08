import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/goals", label: "Goals", icon: "flag" },
    { path: "/mental-health", label: "Mental", icon: "sentiment_satisfied_alt" },
    { path: "/productivity", label: "Productivity", icon: "schedule" },
    { path: "/learning", label: "Learning", icon: "school" },
    { path: "/settings", label: "Settings", icon: "settings" }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex flex-col items-center py-3 px-2 relative",
              location === item.path 
                ? "text-primary-600 dark:text-blue-400 font-medium" 
                : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            {location === item.path && (
              <div className="absolute -top-1 w-1/2 h-1 bg-primary-600 dark:bg-blue-400 rounded-b-full"></div>
            )}
            <span className="material-icons text-lg">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MobileNavigation;
